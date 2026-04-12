export class CodeAnalyzer {
  /**
   * Calculates Cyclomatic Complexity based on branching keywords.
   * This is a "classic" heuristic approach for polyglot systems.
   */
  static calculateComplexity(content: string): number {
    const keywords = [
      /\bif\b/g,
      /\belse\b/g,
      /\bfor\b/g,
      /\bwhile\b/g,
      /\bcase\b/g,
      /\bcatch\b/g,
      /\b&&/g,
      /\|\|/g,
      /\?/g, // Ternary operators
    ];

    let complexity = 1; // Base complexity
    keywords.forEach((regex) => {
      const matches = content.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  /**
   * Detects high-entropy secrets and classic patterns.
   */
  static detectSecrets(content: string): { type: string, line: number, snippet: string }[] {
    const patterns = [
      {
        type: 'Generic Secret',
        regex: /(?:"|')?([a-zA-Z0-9_\-\.]{32,})(?:"|')?/g, // High entropy strings
      },
      {
        type: 'Private Key',
        regex: /-----BEGIN (?:RSA |EC |PGP )?PRIVATE KEY-----/g,
      },
      {
        type: 'AWS Key',
        regex: /AKIA[0-9A-Z]{16}/g,
      }
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
