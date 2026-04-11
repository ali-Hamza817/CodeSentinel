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

export interface StaticFinding {
  line: number;
  severity: 'critical' | 'warning' | 'info';
  type: string;
  message: string;
  description: string;
  snippet: string;
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

  async scanFile(filePath: string): Promise<StaticFinding[]> {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split('\n');
    const findings: StaticFinding[] = [];

    const patterns = [
      {
        regex: /(password|api_key|secret|token|private_key)\s*[:=]\s*["'][^"']{3,}["']/gi,
        severity: 'critical' as const,
        type: 'Hardcoded Secret',
        message: 'Sensitive information detected in source code',
        description: 'Hardcoded credentials can be exploited if the source code is compromised.'
      },
      {
        regex: /query\s*\(.*?\s*\+\s*.*?\)/gi,
        severity: 'warning' as const,
        type: 'SQL Injection',
        message: 'Potential SQL injection vulnerability',
        description: 'String concatenation in SQL queries is unsafe. Use parameterized queries instead.'
      },
      {
        regex: /eval\s*\(.*?\)/gi,
        severity: 'critical' as const,
        type: 'Unsafe Execution',
        message: 'Use of eval() function detected',
        description: 'eval() is dangerous as it executes arbitrary code. Use safer alternatives.'
      },
      {
        regex: /innerHTML\s*=\s*.*?\+/gi,
        severity: 'warning' as const,
        type: 'XSS Risk',
        message: 'Unsafe DOM assignment detected',
        description: 'Using innerHTML with dynamic content can lead to Cross-Site Scripting (XSS).'
      },
      {
        regex: /(md5|sha1)\s*\(/gi,
        severity: 'info' as const,
        type: 'Weak Crypto',
        message: 'Deprecated hash algorithm used',
        description: 'MD5 and SHA-1 are considered cryptographically broken. Use SHA-256 or higher.'
      }
    ];

    lines.forEach((lineText, index) => {
      patterns.forEach(p => {
        if (p.regex.test(lineText)) {
          findings.push({
            line: index + 1,
            severity: p.severity,
            type: p.type,
            message: p.message,
            description: p.description,
            snippet: lineText.trim()
          });
        }
      });
    });

    return findings;
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
