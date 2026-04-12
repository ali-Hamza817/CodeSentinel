import { Ollama } from 'ollama';

export interface AIReviewResult {
  file: string;
  line?: number;
  snippet: string;
  issue: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  recommendation: string;
}

export class AIService {
  private model: string = 'llama3.2';
  private client: Ollama;
  private modelConfirmedReady: boolean = false; // cached — check once per session

  constructor() {
    this.client = new Ollama({ host: 'http://127.0.0.1:11434' });
  }

  /** Check once and cache the result for the session */
  async isModelReady(): Promise<boolean> {
    if (this.modelConfirmedReady) return true;
    try {
      const list = await this.client.list();
      const found = (list.models || []).some((m: any) =>
        (m.name || '').includes('llama3.2')
      );
      if (found) {
        this.modelConfirmedReady = true;
        console.log('[AIService] llama3.2 confirmed ready ✓');
      }
      return found;
    } catch (err) {
      console.warn('[AIService] Could not reach Ollama container:', err);
      return false;
    }
  }

  private extractJsonArray(text: string): any[] {
    // 1. Try to extract a JSON array from the text
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try { return JSON.parse(arrayMatch[0]); } catch {}
    }
    // 2. Try the whole text as JSON
    try {
      const parsed = JSON.parse(text.trim());
      if (Array.isArray(parsed)) return parsed;
      for (const key of ['findings', 'issues', 'vulnerabilities', 'results']) {
        if (Array.isArray(parsed[key])) return parsed[key];
      }
    } catch {}
    return [];
  }

  async getSecurityReview(code: string, fileName: string): Promise<AIReviewResult[]> {
    // Check readiness (uses cache after first successful check)
    const ready = await this.isModelReady();
    if (!ready) {
      console.warn(`[AIService] llama3.2 not ready — skipping: ${fileName}`);
      return [];
    }

    const ext = fileName.split('.').pop() || '';
    const langHint = ext === 'cs' ? 'C#' : ext === 'py' ? 'Python' : ext === 'js' || ext === 'ts' ? 'TypeScript/JavaScript' : ext;

    const prompt = `Analyze this ${langHint} code for security vulnerabilities. File: "${fileName}"

Return ONLY a JSON array. Each item must be exactly:
{"file":"${fileName}","line":<number>,"snippet":"<code>","issue":"<title>","severity":"Critical|High|Medium|Low","recommendation":"<fix>"}

Focus: hardcoded secrets, SQL injection, XSS, missing error handling, insecure APIs, resource leaks, input validation.
Output the JSON array only — no explanation, no markdown.

Code:
${code.slice(0, 5000)}`;

    try {
      console.log(`[AIService] → Analyzing: ${fileName}`);
      let fullResponse = '';

      const stream = await this.client.generate({
        model: this.model,
        prompt,
        stream: true,
        options: { temperature: 0.1, num_predict: 1500 }
      });

      for await (const chunk of stream) {
        fullResponse += chunk.response;
        // Early exit once we have a complete JSON array
        const trimmed = fullResponse.trim();
        if (trimmed.endsWith(']') && trimmed.startsWith('[')) break;
      }

      const results = this.extractJsonArray(fullResponse);
      console.log(`[AIService] ← ${fileName}: ${results.length} findings`);
      return results;

    } catch (error) {
      console.error(`[AIService] Error for ${fileName}:`, error);
      return [];
    }
  }
}
