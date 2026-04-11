import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  AlertTriangle,
  AlertCircle,
  Info,
} from "lucide-react";
import { Badge } from "../components/ui/badge";

const fileTree = [
  {
    name: "src",
    type: "folder",
    children: [
      {
        name: "auth",
        type: "folder",
        children: [
          { name: "login.ts", type: "file", issues: 2 },
          { name: "middleware.ts", type: "file", issues: 5 },
        ],
      },
      {
        name: "api",
        type: "folder",
        children: [
          { name: "users.ts", type: "file", issues: 0 },
          { name: "products.ts", type: "file", issues: 1 },
        ],
      },
      { name: "index.ts", type: "file", issues: 0 },
    ],
  },
  { name: "package.json", type: "file", issues: 0 },
  { name: "tsconfig.json", type: "file", issues: 0 },
];

const issues = [
  {
    line: 23,
    severity: "critical",
    type: "Code Smell",
    message: "Hardcoded credentials detected",
    description: "Avoid storing sensitive information in source code",
  },
  {
    line: 45,
    severity: "warning",
    type: "Unsafe Pattern",
    message: "SQL query constructed using string concatenation",
    description: "Use parameterized queries to prevent SQL injection",
  },
  {
    line: 67,
    severity: "info",
    type: "Code Smell",
    message: "Function complexity exceeds threshold",
    description: "Consider breaking down into smaller functions",
  },
];

const codeContent = `import express from 'express';
import { connectDatabase } from './database';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Authentication endpoint
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const db = await connectDatabase();

    // ⚠️ Critical: Hardcoded credentials
    const adminPassword = "admin123";

    if (password === adminPassword) {
      return res.json({ success: true, token: generateToken() });
    }

    // ⚠️ Warning: SQL Injection vulnerability
    const query = "SELECT * FROM users WHERE username = '" + username + "'";
    const result = await db.query(query);

    if (result.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ success: true, user: result[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`;

function FileTreeItem({ item, level = 0 }: { item: any; level?: number }) {
  const [isOpen, setIsOpen] = useState(level < 2);

  if (item.type === "file") {
    return (
      <div
        className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 rounded cursor-pointer"
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        <File className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-700">{item.name}</span>
        {item.issues > 0 && (
          <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0">
            {item.issues}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 rounded cursor-pointer"
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
        <Folder className="w-4 h-4 text-blue-500" />
        <span className="text-sm font-medium text-slate-700">{item.name}</span>
      </div>
      {isOpen && item.children && (
        <div>
          {item.children.map((child: any, index: number) => (
            <FileTreeItem key={index} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function StaticAnalysis() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-2xl font-semibold text-slate-900">Static Analysis</h2>
        <p className="text-sm text-slate-500 mt-1">
          Code quality and pattern analysis
        </p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer */}
        <div className="w-80 border-r border-slate-200 bg-white overflow-y-auto">
          <div className="p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Project Files
            </h3>
            <div className="space-y-0.5">
              {fileTree.map((item, index) => (
                <FileTreeItem key={index} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Code Viewer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-slate-50">
            <div className="p-6">
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    src/auth/middleware.ts
                  </span>
                  <Badge variant="outline" className="text-xs">
                    TypeScript
                  </Badge>
                </div>
                <div className="p-4">
                  <pre className="text-sm font-mono leading-relaxed">
                    <code className="text-slate-700">{codeContent}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Issues Panel */}
          <div className="h-64 border-t border-slate-200 bg-white overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                Issues Detected
              </h3>
              <div className="space-y-2">
                {issues.map((issue, index) => {
                  const Icon =
                    issue.severity === "critical"
                      ? AlertCircle
                      : issue.severity === "warning"
                      ? AlertTriangle
                      : Info;

                  return (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Icon
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            issue.severity === "critical"
                              ? "text-red-500"
                              : issue.severity === "warning"
                              ? "text-yellow-500"
                              : "text-blue-500"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                issue.severity === "critical"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : issue.severity === "warning"
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}
                            >
                              {issue.type}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              Line {issue.line}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-900 mb-1">
                            {issue.message}
                          </p>
                          <p className="text-xs text-slate-600">
                            {issue.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
