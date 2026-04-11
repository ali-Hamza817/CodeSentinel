import { simpleGit } from 'simple-git';
import path from 'path';
import fs from 'fs-extra';
import { app } from 'electron';

export interface ScanMetrics {
  totalFiles: number;
  vulnerabilities: number;
  avgComplexity: number;
  buildStatus: 'Passed' | 'Failed' | 'Pending';
}

export class RepoService {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(app.getPath('userData'), 'workspaces');
    fs.ensureDirSync(this.baseDir);
  }

  async cloneRepository(repoUrl: string): Promise<{ id: string, name: string, localPath: string }> {
    const repoName = repoUrl.split('/').pop()?.replace('.git', '') || 'unknown-repo';
    const projectId = Math.random().toString(36).substring(7);
    const localPath = path.join(this.baseDir, `${repoName}-${projectId}`);

    try {
      await simpleGit().clone(repoUrl, localPath);
      return { id: projectId, name: repoName, localPath };
    } catch (error) {
      console.error('Cloning error:', error);
      throw new Error(`Failed to clone repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyzeProject(projectPath: string): Promise<ScanMetrics> {
    const files = await this.getAllFiles(projectPath);
    const totalFiles = files.length;
    
    // Simulate vulnerabilities for now (real logic would involve regex/static analysis)
    // We'll perform a basic "secret-leak" check for demo purposes
    let vulnerabilities = 0;
    for (const file of files) {
      const content = await fs.readFile(file, 'utf8');
      if (content.includes('password') || content.includes('api_key') || content.includes('secret')) {
        vulnerabilities++;
      }
    }

    return {
      totalFiles,
      vulnerabilities,
      avgComplexity: Math.floor(Math.random() * 10) + 5, // Simulated
      buildStatus: 'Passed'
    };
  }

  async getFiles(projectPath: string): Promise<string[]> {
    return await this.getAllFiles(projectPath);
  }

  private async getAllFiles(dirPath: string): Promise<string[]> {
    let results: string[] = [];
    const list = await fs.readdir(dirPath);
    for (const file of list) {
      const filePath = path.resolve(dirPath, file);
      const stat = await fs.stat(filePath);
      if (stat && stat.isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules') {
          results = results.concat(await this.getAllFiles(filePath));
        }
      } else {
        if (filePath.endsWith('.js') || filePath.endsWith('.ts') || filePath.endsWith('.py') || filePath.endsWith('.go')) {
          results.push(filePath);
        }
      }
    }
    return results;
  }
}
