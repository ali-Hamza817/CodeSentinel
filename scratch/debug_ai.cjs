const { AIService } = require('./out/main/aiService');
const fs = require('fs');

async function test() {
  const ai = new AIService();
  const code = fs.readFileSync('D:\\CodeSentinel\\test-repo\\Speech to Text & Text to Speech\\Form1.cs', 'utf8');
  console.log('Testing AIService.getSecurityReview...');
  const results = await ai.getSecurityReview(code, 'Form1.cs');
  console.log('Results:', JSON.stringify(results, null, 2));
}

test().catch(console.error);
