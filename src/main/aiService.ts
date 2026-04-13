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

  async getSecurityReview(code: string, fileName: string, onChunk?: (chunk: string) => void): Promise<AIRendererResponse> {
    const ready = await this.isModelReady();
    if (!ready) return { findings: [], measures: [] };

    const ext = fileName.split('.').pop() || '';
    const lang = ext === 'cs' ? 'C#' : ext === 'py' ? 'Python' : 'JavaScript';

    const prompt = `Perform a HIGH-INTENSITY security audit on this ${lang} code. File: "${fileName}"

You must return your response in TWO SECTIONS. 
Section 1: Detailed Architectural Reasoning (Narrative explaining your thoughts).
Section 2: The structured JSON findings.

Structure:
[[REASONING]]
(Detailed expert narrative here)
[[JSON]]
{
  "findings": [
    {"file": "${fileName}", "line": 0, "snippet": "code", "issue": "vulnerability", "severity": "Critical|High|Medium|Low", "recommendation": "fix"}
  ],
  "measures": [
    "One sentence security architecture recommendation for this file"
  ]
}

Focus on: hardcoded secrets, unsafe API usage, input validation, logic flaws, and .NET security best practices.
Code:
${code.slice(0, 6000)}`;

    try {
      let fullResponse = '';
      const stream = await this.client.generate({
        model: this.model,
        prompt,
        stream: true,
        options: { temperature: 0.1, num_predict: 2500 }
      });

      for await (const chunk of stream) {
        fullResponse += chunk.response;
        if (onChunk) onChunk(chunk.response);
      }

      // Extract JSON part for structural storage, everything else is reasoning
      const jsonParts = fullResponse.split('[[JSON]]');
      const narrative = jsonParts[0].replace('[[REASONING]]', '').trim();
      const jsonContent = jsonParts[1] || '';

      const structured = this.extractStructuredResponse(jsonContent);
      return {
        findings: structured.findings,
        measures: structured.measures,
        // @ts-ignore
        reasoning: narrative 
      };
    } catch (error) {
      console.error(`[AIService] Inference failed:`, error);
      return { findings: [], measures: [] };
    }
  }

  async chatWithArchitect(messages: { role: string; content: string }[], onChunk?: (chunk: string) => void): Promise<string> {
    const ready = await this.isModelReady();
    if (!ready) return "AI Service is not ready. Please ensure Ollama is running Llama 3.2.";

    const systemPrompt = {
      role: 'system',
      content: `You are the CodeSentinel AI Security Architect.
      When providing fixes, be specific to the lines of code provided. Use markdown formatting.`
    };

    try {
      const finalMessages = [systemPrompt, ...messages];
      let fullText = '';

      if (onChunk) {
        const stream = await this.client.chat({
          model: this.model,
          messages: finalMessages,
          stream: true,
          options: { temperature: 0.7 }
        });

        for await (const chunk of stream) {
          const content = chunk.message.content;
          fullText += content;
          onChunk(content);
        }
        return fullText;
      } else {
        const response = await this.client.chat({
          model: this.model,
          messages: finalMessages,
          stream: false,
          options: { temperature: 0.7 }
        });
        return response.message.content;
      }
    } catch (error) {
      console.error(`[AIService] Chat failed:`, error);
      return "I encountered an error while processing your request.";
    }
  }
}
