import { simpleGit } from 'simple-git';
import path from 'path';
import fs from 'fs-extra';
import { app } from 'electron';
import { AIService } from './aiService';
import { CodeAnalyzer } from './analyzer';

const aiService = new AIService();

export interface ScanMetrics {
  totalFiles: number;
  vulnerabilities: number;
  avgComplexity: number;
  totalBranches?: number;
  highRiskFunctions?: { name: string; score: number; file: string; line: number }[];
  buildStatus: 'Passed' | 'Failed' | 'Pending';
}

export interface StaticFinding {
  file: string;       // relative path inside the repo
  line: number;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  type: string;
  title: string;      // short human-readable title
  description: string;
  snippet: string;
  suggestedFix?: string;
}

export class RepoService {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(app.getPath('userData'), 'workspaces');
    fs.ensureDirSync(this.baseDir);
  }

  async cloneRepository(repoUrl: string): Promise<{ id: string; name: string; localPath: string }> {
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

  async analyzeProject(
    projectPath: string,
    onProgress?: (p: { progress: number; file: string }) => void
  ): Promise<{ metrics: ScanMetrics; findings: StaticFinding[] }> {
    const files = await this.getAllFiles(projectPath);
    const totalFiles = files.length;
    const findings: StaticFinding[] = [];
    let totalComplexity = 0;
    const allHighRiskFunctions: any[] = [];
    let grandTotalBranches = 0;

    for (let i = 0; i < totalFiles; i++) {
      const filePath = files[i];
      const relativePath = path.relative(projectPath, filePath);

      if (onProgress) {
        onProgress({
          progress: Math.round(((i) / totalFiles) * 95),
          file: relativePath
        });
      }

      try {
        const content = await fs.readFile(filePath, 'utf8');

        // 1. Logic Intelligence (Cyclomatic Analysis)
        const compReport = CodeAnalyzer.analyzeComplexity(content, relativePath);
        totalComplexity += compReport.avgComplexity;
        grandTotalBranches += compReport.totalBranches;
        allHighRiskFunctions.push(...compReport.highRiskFunctions.map(f => ({...f, file: relativePath })));

        // 2. Initial Scans (Patterns + Secrets)
        const patternFindings = this.runPatternScan(content, relativePath);
        const secrets = CodeAnalyzer.detectSecrets(content);
        
        const pendingEnrichment = [
          ...patternFindings,
          ...secrets.map(s => ({
            file: relativePath,
            line: s.line,
            severity: 'critical' as const,
            type: 'Secret',
            title: `Hardcoded Secret: ${s.type}`,
            description: `Exposed credential detected.`,
            snippet: s.snippet,
            suggestedFix: 'Replace with env var.'
          }))
        ];

        // 3. Guaranteed Unique Enrichment via Architect
        if (pendingEnrichment.length > 0) {
          const enrichmentPrompt = `As CodeSentinel AI Architect, enrich these ${pendingEnrichment.length} findings in ${relativePath}.
          FULL SOURCE CONTEXT:
          \`\`\`
          ${content.slice(0, 8000)}
          \`\`\`
          FINDINGS TO UNIQUE-IFY:
          ${JSON.stringify(pendingEnrichment.map(f => ({ line: f.line, title: f.title, snippet: f.snippet })))}

          REQUIREMENT: Provide a HIGHLY SPECIFIC, unique description and fix for EVERY finding. ZERO REPETITION.
          RESPONSE FORMAT: JSON Array ONLY: [{"line": number, "description": "Expert unique explanation", "fix": "Specific code fix"}]`;

          const aiData = await aiService.chatWithArchitect([{ role: 'user', content: enrichmentPrompt }]);
          try {
            const match = aiData.match(/\[[\s\S]*\]/);
            const enriched = JSON.parse(match ? match[0] : '[]');
            enriched.forEach((item: any) => {
              const target = pendingEnrichment.find(f => f.line === item.line);
              if (target) {
                target.description = item.description;
                target.suggestedFix = item.fix;
              }
            });
          } catch (e) { console.error("Enrichment parse failed", e); }
        }
        findings.push(...pendingEnrichment);

        // 4. LLM Deep Reasoning
        if (content.length < 15000) {
          const aiResponse = await aiService.getSecurityReview(content, relativePath);
          const aiFindings = (aiResponse.findings || []).map(af => ({
            file: relativePath,
            line: af.line || 0,
            severity: af.severity.toLowerCase() as any,
            type: `AI: ${af.issue}`,
            title: af.issue,
            description: af.recommendation,
            snippet: af.snippet || '',
            suggestedFix: af.recommendation
          }));
          findings.push(...aiFindings);
        }
      } catch (err) {
        console.error(`Audit failed for ${relativePath}:`, err);
      }
    }

    if (onProgress) onProgress({ progress: 100, file: 'Synching Data...' });

    const metrics: ScanMetrics = {
      totalFiles,
      vulnerabilities: findings.filter(f => f.severity === 'critical' || f.severity === 'high').length,
      avgComplexity: totalFiles > 0 ? totalComplexity / totalFiles : 0,
      totalBranches: grandTotalBranches,
      highRiskFunctions: allHighRiskFunctions.sort((a, b) => b.score - a.score).slice(0, 15),
      buildStatus: 'Passed'
    };

    return { metrics, findings };
  }

  // ── Pattern-based scanning (independent of AI) ──────────────────────────
  private runPatternScan(content: string, relativePath: string): StaticFinding[] {
    const findings: StaticFinding[] = [];
    const lines = content.split('\n');

    const patterns = [
      {
        regex: /(password|api_key|secret|token|private_key)\s*[:=]\s*["'][^"']{3,}["']/gi,
        severity: 'critical' as const,
        type: 'Hardcoded Credential',
        title: 'Hardcoded Credential',
        description: 'Sensitive credentials hardcoded in source. Attackers with repo access can extract and abuse these.',
        suggestedFix: 'Use environment variables: process.env.MY_SECRET instead of hardcoding values.'
      },
      {
        regex: /query\s*\(.*?\+.*?\)/gi,
        severity: 'high' as const,
        type: 'SQL Injection',
        title: 'SQL Injection Risk',
        description: 'String concatenation inside SQL query — attackers can inject arbitrary SQL.',
        suggestedFix: 'Use parameterized queries or an ORM: db.query("SELECT * WHERE id = ?", [id])'
      },
      {
        regex: /eval\s*\(/gi,
        severity: 'critical' as const,
        type: 'Unsafe Code Execution',
        title: 'eval() Usage Detected',
        description: 'eval() executes arbitrary code. A single attacker-controlled input leads to RCE.',
        suggestedFix: 'Replace eval() with JSON.parse() or Function() with strict input validation.'
      },
      {
        regex: /innerHTML\s*=\s*[^;'"]+\+/gi,
        severity: 'high' as const,
        type: 'XSS Vulnerability',
        title: 'Cross-Site Scripting (XSS)',
        description: 'Dynamic content assigned to innerHTML allows script injection.',
        suggestedFix: 'Use textContent instead, or sanitize with DOMPurify before assignment.'
      },
      {
        regex: /(md5|sha1)\s*\(/gi,
        severity: 'medium' as const,
        type: 'Weak Cryptography',
        title: 'Deprecated Hash Algorithm',
        description: 'MD5 and SHA-1 are cryptographically broken and collision-prone.',
        suggestedFix: 'Use SHA-256 or bcrypt/argon2 for passwords.'
      }
    ];

    lines.forEach((line, idx) => {
      patterns.forEach(p => {
        p.regex.lastIndex = 0; // reset stateful regex
        if (p.regex.test(line)) {
          findings.push({
            file: relativePath,
            line: idx + 1,
            severity: p.severity,
            type: p.type,
            title: p.title,
            description: p.description,
            snippet: line.trim().slice(0, 200),
            suggestedFix: p.suggestedFix
          });
        }
      });
    });

    return findings;
  }

  async getFiles(projectPath: string): Promise<string[]> {
    return this.getAllFiles(projectPath);
  }

  async deleteProjectWorkspace(projectPath: string): Promise<void> {
    try {
      if (await fs.pathExists(projectPath)) {
        await fs.remove(projectPath);
      }
    } catch (error) {
      console.error('[RepoService] Failed to delete workspace:', error);
    }
  }

  async scanFile(filePath: string): Promise<StaticFinding[]> {
    const content = await fs.readFile(filePath, 'utf8');
    const relativePath = path.basename(filePath);
    return this.runPatternScan(content, relativePath);
  }

  private async getAllFiles(dirPath: string): Promise<string[]> {
    let results: string[] = [];
    if (!await fs.pathExists(dirPath)) return results;

    const list = await fs.readdir(dirPath);
    for (const file of list) {
      const filePath = path.resolve(dirPath, file);
      const stat = await fs.stat(filePath);
      if (stat && stat.isDirectory()) {
        if (!file.startsWith('.') && !['node_modules', 'dist', 'out', 'build', 'coverage', '.git'].includes(file)) {
          results = results.concat(await this.getAllFiles(filePath));
        }
      } else {
        const ext = path.extname(filePath);
        if (['.js', '.ts', '.py', '.go', '.tsx', '.jsx', '.rb', '.java', '.php', '.cs', '.cpp', '.c', '.swift', '.kt', '.rs'].includes(ext)) {
          results.push(filePath);
        }
      }
    }
    return results;
  }
}
