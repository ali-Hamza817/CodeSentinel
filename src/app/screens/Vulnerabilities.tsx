import { useState } from "react";
import { Shield, AlertCircle, AlertTriangle, Info, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

const vulnerabilities = [
  {
    id: 1,
    severity: "critical",
    title: "SQL Injection in User Authentication",
    description: "Direct string concatenation used in SQL query construction",
    file: "src/auth/login.ts",
    line: 45,
    cwe: "CWE-89",
    affectedCode: `const query = "SELECT * FROM users WHERE username = '" + username + "'";`,
    suggestedFix: `const query = "SELECT * FROM users WHERE username = ?";
db.query(query, [username]);`,
  },
  {
    id: 2,
    severity: "critical",
    title: "Hardcoded Credentials",
    description: "Sensitive credentials stored directly in source code",
    file: "src/config/database.ts",
    line: 12,
    cwe: "CWE-798",
    affectedCode: `const dbPassword = "admin123";`,
    suggestedFix: `const dbPassword = process.env.DB_PASSWORD;`,
  },
  {
    id: 3,
    severity: "critical",
    title: "Insufficient Session Token Encryption",
    description: "Session tokens stored without proper encryption",
    file: "src/auth/session.ts",
    line: 78,
    cwe: "CWE-326",
    affectedCode: `localStorage.setItem('token', token);`,
    suggestedFix: `sessionStorage.setItem('token', encryptToken(token));`,
  },
  {
    id: 4,
    severity: "high",
    title: "Cross-Site Scripting (XSS) Vulnerability",
    description: "User input rendered without sanitization",
    file: "src/components/UserProfile.tsx",
    line: 34,
    cwe: "CWE-79",
    affectedCode: `<div dangerouslySetInnerHTML={{ __html: userBio }} />`,
    suggestedFix: `<div>{sanitizeHtml(userBio)}</div>`,
  },
  {
    id: 5,
    severity: "high",
    title: "Insecure Random Number Generation",
    description: "Math.random() used for security-sensitive operations",
    file: "src/utils/crypto.ts",
    line: 23,
    cwe: "CWE-338",
    affectedCode: `const token = Math.random().toString(36);`,
    suggestedFix: `const token = crypto.randomBytes(32).toString('hex');`,
  },
  {
    id: 6,
    severity: "medium",
    title: "Missing Input Validation",
    description: "User input not validated before processing",
    file: "src/api/products.ts",
    line: 56,
    cwe: "CWE-20",
    affectedCode: `const productId = req.params.id;`,
    suggestedFix: `const productId = validateId(req.params.id);`,
  },
];

function VulnerabilityCard({ vulnerability }: { vulnerability: typeof vulnerabilities[0] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const Icon =
    vulnerability.severity === "critical"
      ? AlertCircle
      : vulnerability.severity === "high"
      ? AlertTriangle
      : Info;

  return (
    <Card className="border-slate-200">
      <CardContent className="p-5">
        <div
          className="flex items-start gap-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div
            className={`p-2.5 rounded-lg shrink-0 ${
              vulnerability.severity === "critical"
                ? "bg-red-100"
                : vulnerability.severity === "high"
                ? "bg-orange-100"
                : "bg-yellow-100"
            }`}
          >
            <Icon
              className={`w-5 h-5 ${
                vulnerability.severity === "critical"
                  ? "text-red-600"
                  : vulnerability.severity === "high"
                  ? "text-orange-600"
                  : "text-yellow-600"
              }`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-slate-900">
                  {vulnerability.title}
                </h3>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    vulnerability.severity === "critical"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : vulnerability.severity === "high"
                      ? "bg-orange-50 text-orange-700 border-orange-200"
                      : "bg-yellow-50 text-yellow-700 border-yellow-200"
                  }`}
                >
                  {vulnerability.severity}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {vulnerability.cwe}
                </Badge>
              </div>
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
              )}
            </div>

            <p className="text-sm text-slate-600 mb-2">
              {vulnerability.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>{vulnerability.file}</span>
              <span>Line {vulnerability.line}</span>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">
                Affected Code
              </h4>
              <pre className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-mono overflow-x-auto">
                <code className="text-red-900">{vulnerability.affectedCode}</code>
              </pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">
                Suggested Fix
              </h4>
              <pre className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs font-mono overflow-x-auto">
                <code className="text-green-900">{vulnerability.suggestedFix}</code>
              </pre>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                View File
              </Button>
              <Button size="sm" variant="outline">
                Mark as Fixed
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function Vulnerabilities() {
  const criticalCount = vulnerabilities.filter((v) => v.severity === "critical").length;
  const highCount = vulnerabilities.filter((v) => v.severity === "high").length;
  const mediumCount = vulnerabilities.filter((v) => v.severity === "medium").length;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Vulnerabilities</h2>
        <p className="text-sm text-slate-500 mt-1">
          Security issues detected in your codebase
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 mb-1">Critical Issues</p>
                <p className="text-3xl font-semibold text-red-700">
                  {criticalCount}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 mb-1">High Issues</p>
                <p className="text-3xl font-semibold text-orange-700">
                  {highCount}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 mb-1">Medium Issues</p>
                <p className="text-3xl font-semibold text-yellow-700">
                  {mediumCount}
                </p>
              </div>
              <Info className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vulnerability List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-900">All Vulnerabilities</h3>
        {vulnerabilities.map((vulnerability) => (
          <VulnerabilityCard key={vulnerability.id} vulnerability={vulnerability} />
        ))}
      </div>
    </div>
  );
}
