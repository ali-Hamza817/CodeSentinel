import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { exec } from 'child_process'
import os from 'os'
import sqlite3 from 'sqlite3'
import { RepoService } from './repoService'
import { AIService } from './aiService'
import { ExecutionService } from './executionService'
import fs from 'fs-extra'

const repoService = new RepoService()
const aiService = new AIService()
const executionService = new ExecutionService()

let mainWindow: BrowserWindow
let db: sqlite3.Database

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    frame: false, // Frameless for custom titlebar
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // Window Controls IPC
  ipcMain.on('window-minimize', () => {
    mainWindow.minimize()
  })

  ipcMain.on('window-maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })

  ipcMain.on('window-close', () => {
    mainWindow.close()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Database Initialization + Migration
function initDatabase() {
  const dbPath = join(app.getPath('userData'), 'codesentinel.db')
  db = new sqlite3.Database(dbPath)
  db.serialize(() => {
    // Create table with full schema
    db.run(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT,
        url TEXT,
        path TEXT,
        last_scan TEXT,
        status TEXT,
        metrics TEXT,
        findings TEXT,
        sandbox_status TEXT,
        ai_reviews TEXT
      )
    `)
    // Safe migration for older DBs — ignore errors if columns already exist
    const newCols = ['path TEXT', 'metrics TEXT', 'findings TEXT', 'sandbox_status TEXT', 'ai_reviews TEXT']
    newCols.forEach(col => {
      db.run(`ALTER TABLE projects ADD COLUMN ${col}`, () => {/* ignore error if exists */})
    })
  })
}

// System Probes
ipcMain.handle('check-system-health', async () => {
  const totalMem = os.totalmem() / (1024 * 1024 * 1024) // GB
  const cpuCores = os.cpus().length
  
  return {
    ram: {
      value: totalMem.toFixed(1),
      status: totalMem >= 7.5 ? 'pass' : 'fail'
    },
    cpu: {
      value: cpuCores,
      status: cpuCores >= 4 ? 'pass' : 'fail'
    }
  }
})

ipcMain.handle('check-docker', async () => {
  return new Promise((resolve) => {
    exec('docker info', (error) => {
      resolve(error ? 'not_running' : 'running')
    })
  })
})

ipcMain.handle('pull-ollama-model', async (event) => {
  return await executionService.pullModelInContainer('llama3.2', (data) => {
    event.sender.send('ai-pull-log', data)
  })
})

ipcMain.handle('ensure-ai-container', async () => {
  try {
    return await executionService.ensureOllamaContainer()
  } catch (err) {
    return 'error'
  }
})

// Database IPC
ipcMain.handle('get-projects', () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM projects', (err: any, rows: any[]) => {
      if (err) { reject(err); return; }
      // Deserialize JSON fields back to objects
      const projects = (rows || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        url: row.url,
        path: row.path || '',
        lastScanned: row.last_scan || 'Never',
        status: row.status || 'idle',
        sandboxStatus: row.sandbox_status || 'stopped',
        metrics: row.metrics ? JSON.parse(row.metrics) : { totalFiles: 0, vulnerabilities: 0, avgComplexity: 0, buildStatus: 'Pending' },
        findings: row.findings ? JSON.parse(row.findings) : [],
        aiReviews: row.ai_reviews ? JSON.parse(row.ai_reviews) : {}
      }))
      resolve(projects)
    })
  })
})

ipcMain.handle('save-project', (_, project) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO projects
        (id, name, url, path, last_scan, status, metrics, findings, sandbox_status, ai_reviews)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      project.id,
      project.name,
      project.url,
      project.path || '',
      project.lastScanned || new Date().toLocaleString(),
      project.status || 'idle',
      JSON.stringify(project.metrics || {}),
      JSON.stringify(project.findings || []),
      project.sandboxStatus || 'stopped',
      JSON.stringify(project.aiReviews || {}),
      (err: any) => {
        if (err) reject(err)
        else resolve(true)
      }
    )
    stmt.finalize()
  })
})

// Application Logic IPC
ipcMain.handle('analyze-project', async (event, projectPath) => {
  return await repoService.analyzeProject(projectPath, (p) => {
    event.sender.send('analysis-progress', p)
  })
})

ipcMain.handle('get-files', async (_, projectPath) => {
  return await repoService.getFiles(projectPath)
})

ipcMain.handle('read-file', async (_, filePath) => {
  return await fs.readFile(filePath, 'utf8')
})

ipcMain.handle('clone-repo', async (_, url) => {
  return await repoService.cloneRepository(url)
})

ipcMain.handle('scan-file', async (_, filePath) => {
  return await repoService.scanFile(filePath)
})

ipcMain.handle('delete-project', async (_, id, localPath) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM projects WHERE id = ?', [id], async (err) => {
      if (err) reject(err)
      else {
        if (localPath) {
          await repoService.deleteProjectWorkspace(localPath)
        }
        resolve(true)
      }
    })
  })
})

ipcMain.handle('get-ai-review', async (_, code, fileName) => {
  return await aiService.getSecurityReview(code, fileName)
})

// --- Execution & Docker Handlers ---

ipcMain.handle('run-build', async (event, projectPath) => {
  return await executionService.runBuild(projectPath, (data) => {
    event.sender.send('build-log', data)
  })
})

ipcMain.handle('docker-build', async (event, { id, path }: { id: string; path: string }) => {
  return await executionService.dockerBuild(id, path, (data) => {
    event.sender.send('docker-log', data)
  })
})

ipcMain.handle('docker-run', async (event, id) => {
  return await executionService.dockerRun(id, (data) => {
    event.sender.send('docker-log', data)
  })
})

ipcMain.handle('docker-stop', async (_, id) => {
  return await executionService.dockerStop(id)
})

ipcMain.handle('docker-stats', async (_, id) => {
  return await executionService.getDockerStats(id)
})

app.whenReady().then(() => {
  // Set app user model id for windows
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.codesentinel.app')
  }
  initDatabase()

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
