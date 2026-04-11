import { useState } from "react";
import {
  Sparkles,
  FileCode,
  ChevronRight,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

const files = [
  { name: "src/auth/login.ts", reviewed: true, issues: 3 },
  { name: "src/auth/middleware.ts", reviewed: true, issues: 5 },
  { name: "src/api/users.ts", reviewed: false, issues: 0 },
  { name: "src/api/products.ts", reviewed: false, issues: 0 },
  { name: "src/utils/crypto.ts", reviewed: true, issues: 2 },
];

const aiReview = {
  file: "src/auth/middleware.ts",
  summary:
    "This authentication middleware has several security concerns and maintainability issues that need attention.",
  improvements: [
    {
      title: "Replace hardcoded credentials with environment variables",
      severity: "critical",
      description:
        "The admin password is hardcoded in the source code. Move sensitive credentials to environment variables.",
      code: `const adminPassword = process.env.ADMIN_PASSWORD;`,
    },
    {
      title: "Use parameterized queries to prevent SQL injection",
      severity: "critical",
      description:
        "String concatenation in SQL queries creates injection vulnerabilities. Use parameterized queries instead.",
      code: `const query = "SELECT * FROM users WHERE username = ?";
db.query(query, [username]);`,
    },
    {
      title: "Implement proper error handling",
      severity: "medium",
      description:
        "Generic error messages can leak sensitive information. Implement specific error handling with safe messages.",
      code: `try {
  // operation
} catch (error) {
  logger.error(error);
  return res.status(500).json({ error: 'Operation failed' });
}`,
    },
    {
      title: "Add input validation",
      severity: "medium",
      description:
        "User inputs should be validated before processing to prevent malformed data attacks.",
      code: `if (!username || typeof username !== 'string') {
  return res.status(400).json({ error: 'Invalid input' });
}`,
    },
    {
      title: "Extract complex logic into separate functions",
      severity: "low",
      description:
        "The authentication function is too complex. Break it down into smaller, testable units.",
      code: `const validateCredentials = (username, password) => { /* ... */ };
const generateSession = (user) => { /* ... */ };`,
    },
  ],
  risks: [
    "SQL injection vulnerability allows unauthorized database access",
    "Hardcoded credentials can be exposed in version control",
    "Poor error handling may leak sensitive system information",
    "Lack of input validation creates attack surface",
  ],
};

export function AIReview() {
  const [selectedFile, setSelectedFile] = useState(files[1]);
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold text-slate-900">AI Review</h2>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Powered by Local AI (Ollama)
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Intelligent code analysis and recommendations
            </p>
          </div>
          <Button
            onClick={() => setIsGenerating(true)}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate Review"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* File List */}
        <div className="w-80 border-r border-slate-200 bg-white overflow-y-auto">
          <div className="p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Files
            </h3>
            <div className="space-y-1">
              {files.map((file, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedFile(file)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedFile.name === file.name
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileCode className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-700 truncate">
                      {file.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {file.reviewed && (
                      <>
                        {file.issues > 0 && (
                          <Badge variant="destructive" className="text-xs px-1.5 py-0">
                            {file.issues}
                          </Badge>
                        )}
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Review Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="p-6 space-y-6">
            {/* Summary */}
            <Card className="border-slate-200 bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">
                      AI Summary
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {aiReview.summary}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Suggested Improvements */}
            <Card className="border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <CardTitle className="text-base">
                    Suggested Improvements
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiReview.improvements.map((improvement, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-slate-200 bg-white"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <ChevronRight className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-slate-900">
                            {improvement.title}
                          </h4>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              improvement.severity === "critical"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : improvement.severity === "medium"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {improvement.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">
                          {improvement.description}
                        </p>
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                          <p className="text-xs text-slate-500 mb-1">
                            Suggested code:
                          </p>
                          <pre className="text-xs font-mono text-slate-800 overflow-x-auto">
                            <code>{improvement.code}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Risk Explanation */}
            <Card className="border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <CardTitle className="text-base">Risk Analysis</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {aiReview.risks.map((risk, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0" />
                      <span className="text-sm text-slate-700">{risk}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
