import ollama from 'ollama';

export interface AIReviewResult {
  file: string;
  line?: number;
  snippet: string;
  issue: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  recommendation: string;
}

export class AIService {
  private model: string = 'llama3';

  async pullModelIfNeeded(): Promise<void> {
    try {
      await ollama.pull({ model: this.model });
    } catch (error) {
      console.error('Ollama pull error:', error);
      throw new Error('Failed to connect to Ollama. Please ensure it is running.');
    }
  }

  async getSecurityReview(code: string, fileName: string): Promise<AIReviewResult[]> {
    const prompt = `
      Analyze the following code from file "${fileName}" for security vulnerabilities (CWE).
      Return ONLY a raw JSON array of objects. Do not include markdown code blocks or explanations outside the JSON.
      Each object MUST have:
      - file: string
      - line: number
      - snippet: string (the exact problematic code snippet)
      - issue: string (title/description of the vulnerability)
      - severity: "Critical" | "High" | "Medium" | "Low"
      - recommendation: string (detailed remediation step)

      If no issues are found, return an empty array [].

      Code to analyze:
      ${code}
    `;

    try {
      const response = await ollama.generate({
        model: this.model,
        prompt: prompt,
        format: 'json',
        stream: false
      });

      const results = JSON.parse(response.response);
      return Array.isArray(results) ? results : [];
    } catch (error) {
      console.error('Ollama generation error:', error);
      return [];
    }
  }
}
