import { Ollama } from 'ollama';

export interface AIReviewResult {
  file: string;
  line?: number;
  snippet: string;
  issue: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  recommendation: string;
}

export interface AIRendererResponse {
  findings: AIReviewResult[];
  measures: string[];
}

export class AIService {
  private model: string = 'llama3.2';
  private client: Ollama;
  private modelConfirmedReady: boolean = false;

  constructor() {
    this.client = new Ollama({ host: 'http://127.0.0.1:11434' });
  }

  async isModelReady(): Promise<boolean> {
    if (this.modelConfirmedReady) return true;
    try {
      const list = await this.client.list();
      const found = (list.models || []).some((m: any) =>
        (m.name || '').includes('llama3.2')
      );
      if (found) {
        this.modelConfirmedReady = true;
      }
      return found;
    } catch {
      return false;
    }
  }

  private extractStructuredResponse(text: string): AIRendererResponse {
    let findings: AIReviewResult[] = [];
    let measures: string[] = [];

    // 1. Try to find JSON block
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.findings) findings = parsed.findings;
        if (parsed.measures) measures = parsed.measures;
      } catch {}
    }

    // 2. Fallback: If it's just an array, those are findings
    if (findings.length === 0) {
      const arrayMatch = text.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        try {
          const parsed = JSON.parse(arrayMatch[0]);
          if (Array.isArray(parsed)) findings = parsed;
        } catch {}
      }
    }

    // 3. Last resort: If no findings, try to parse individual lines for lists
    if (findings.length === 0 && measures.length === 0) {
        // Just return empty if totally malformed
    }

    return { findings, measures: measures.slice(0, 5) }; // Caps measures at 5
  }

  async getSecurityReview(code: string, fileName: string): Promise<AIRendererResponse> {
    const ready = await this.isModelReady();
    if (!ready) return { findings: [], measures: [] };

    const ext = fileName.split('.').pop() || '';
    const lang = ext === 'cs' ? 'C#' : ext === 'py' ? 'Python' : 'JavaScript';

    const prompt = `Perform a HIGH-INTENSITY security audit on this ${lang} code. File: "${fileName}"

You must return a JSON object with this EXACT structure:
{
  "findings": [
    {"file": "${fileName}", "line": 0, "snippet": "code", "issue": "vulnerability", "severity": "Critical|High|Medium|Low", "recommendation": "fix"}
  ],
  "measures": [
    "One sentence security architecture recommendation for this file"
  ]
}

Focus on: hardcoded secrets, unsafe API usage, input validation, logic flaws, and .NET security best practices.
Output ONLY the JSON object.

Code:
${code.slice(0, 6000)}`;

    try {
      let fullResponse = '';
      const stream = await this.client.generate({
        model: this.model,
        prompt,
        stream: true,
        options: { temperature: 0.1, num_predict: 2000 }
      });

      for await (const chunk of stream) {
        fullResponse += chunk.response;
        // Early break if we have a closed JSON object at the end
        if (fullResponse.trim().endsWith('}')) break;
      }

      return this.extractStructuredResponse(fullResponse);
    } catch (error) {
      console.error(`[AIService] Inference failed:`, error);
      return { findings: [], measures: [] };
    }
  }
}
