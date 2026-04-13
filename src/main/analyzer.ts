export interface FunctionComplexity {
  name: string;
  score: number;
  file: string;
  line: number;
}

export interface DetailedComplexityReport {
  avgComplexity: number;
  totalBranches: number;
  highRiskFunctions: FunctionComplexity[];
}

export class CodeAnalyzer {
  /**
   * Calculates Cyclomatic Complexity based on branching keywords and block tracking.
   */
  static analyzeComplexity(content: string, fileName: string): DetailedComplexityReport {
    const lines = content.split('\n');
    let totalBranches = 0;
    const functions: FunctionComplexity[] = [];
    
    // Polyglot Function Detection (C#, JS/TS, Python)
    const functionPatterns = [
      { lang: 'cs', regex: /(?:public|private|protected|internal|static|\s) +[\w<>\[\]]+\s+(\w+)\s*\([^)]*\)\s*\{/g },
      { lang: 'js', regex: /(?:function\s+(\w+)|(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>|(\w+)\s*\([^)]*\)\s*\{|(\w+)\s*:\s*(?:async\s*)?\([^)]*\)\s*=>)/g },
      { lang: 'py', regex: /def\s+(\w+)\s*\([^)]*\):/g }
    ];

    const branchKeywords = [
      /\bif\b/g, /\bfor\b/g, /\bwhile\b/g, /\bcase\b/g, /\bcatch\b/g, 
      /\bforeach\b/g, /&&/g, /\|\|/g, /\?/g, /\?\?/g, /\?\./g
    ];

    let currentFunction: FunctionComplexity | null = null;
    let braceCount = 0;

    lines.forEach((line, idx) => {
      // 1. Branch detection
      branchKeywords.forEach(kw => {
        const matches = line.match(kw);
        if (matches) {
          totalBranches += matches.length;
          if (currentFunction) currentFunction.score += matches.length;
        }
      });

      // 2. Class/Method Start detection
      functionPatterns.forEach(p => {
        p.regex.lastIndex = 0;
        const match = p.regex.exec(line);
        if (match) {
          const name = match[1] || match[2] || match[3] || match[4] || 'anonymous';
          currentFunction = { name, score: 1, file: fileName, line: idx + 1 };
          functions.push(currentFunction);
          // Simple curly brace tracking
          braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        }
      });

      // 3. Block tracking (for languages with braces)
      if (currentFunction) {
        braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        if (braceCount <= 0 && (line.includes('}') || (fileName.endsWith('.py') && line.trim() === ''))) {
           // Heuristic: end of function when braces close or empty line after definition
           currentFunction = null;
        }
      }
    });

    // Heuristic for average: prioritize function density
    const avg = functions.length > 0 
      ? functions.reduce((acc, f) => acc + f.score, 0) / functions.length 
      : (totalBranches / Math.max(lines.length / 40, 1)) + 1;

    return {
      avgComplexity: avg,
      totalBranches,
      highRiskFunctions: functions.sort((a, b) => b.score - a.score).slice(0, 10)
    };
  }

  static detectSecrets(content: string): { type: string, line: number, snippet: string }[] {
    const patterns = [
      { type: 'High Entropy Secret', regex: /(?:"|')?([a-zA-Z0-9_\-\.]{32,})(?:"|')?/g },
      { type: 'Private Key Block', regex: /-----BEGIN (?:RSA |EC |PGP )?PRIVATE KEY-----/g },
      { type: 'Cloud Provider Key', regex: /(?:AKIA|AIza|xox[p|b|o|a])[\w\-]{16,64}/g }
    ];

    const results: { type: string, line: number, snippet: string }[] = [];
    const lines = content.split('\n');

    lines.forEach((lineText, index) => {
      patterns.forEach((p) => {
        if (lineText.match(p.regex)) {
          results.push({
            type: p.type,
            line: index + 1,
            snippet: lineText.trim()
          });
        }
      });
    });

    return results;
  }
}
