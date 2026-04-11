import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { exec } from 'child_process'
import os from 'os'
import sqlite3 from 'sqlite3'
import { RepoService } from './repoService'
import { AIService } from './aiService'
import fs from 'fs-extra'

const repoService = new RepoService()
const aiService = new AIService()

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

// Database Initialization
function initDatabase() {
  const dbPath = join(app.getPath('userData'), 'codesentinel.db')
  db = new sqlite3.Database(dbPath)
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT,
        url TEXT,
        last_scan DATETIME,
        status TEXT
      )
    `)
    db.run(`
      CREATE TABLE IF NOT EXISTS findings (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        type TEXT,
        severity TEXT,
        title TEXT,
        description TEXT,
        file_path TEXT,
        line_number INTEGER,
        FOREIGN KEY (project_id) REFERENCES projects (id)
      )
    `)
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

ipcMain.handle('pull-ollama-model', async () => {
  return new Promise((resolve) => {
    exec('ollama pull llama3', (error) => {
      resolve(error ? 'error' : 'success')
    })
  })
})

// Database IPC
ipcMain.handle('get-projects', () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM projects', (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
})

ipcMain.handle('save-project', (_, project) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT OR REPLACE INTO projects (id, name, url, last_scan, status) VALUES (?, ?, ?, ?, ?)')
    stmt.run(project.id, project.name, project.url, project.last_scan, project.status, (err: any) => {
      if (err) reject(err)
      else resolve(true)
    })
  })
})

// Application Logic IPC
ipcMain.handle('analyze-project', async (_, projectPath) => {
  return await repoService.analyzeProject(projectPath)
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

ipcMain.handle('get-ai-review', async (_, code, fileName) => {
  await aiService.pullModelIfNeeded()
  return await aiService.getSecurityReview(code, fileName)
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
