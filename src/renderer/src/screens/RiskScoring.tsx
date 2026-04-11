import { Shield, BarChart3, Activity, AlertTriangle, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

const riskScore = 42;
const maxScore = 100;

const scoreBreakdown = [
  {
    category: "Vulnerability Score",
    score: 35,
    max: 100,
    icon: Shield,
    color: "red",
    description: "3 critical, 8 high, 15 medium vulnerabilities detected",
  },
  {
    category: "Complexity Score",
    score: 58,
    max: 100,
    icon: BarChart3,
    color: "yellow",
    description: "Average cyclomatic complexity of 14.2 across codebase",
  },
  {
    category: "Runtime Risk",
    score: 72,
    max: 100,
    icon: Activity,
    color: "green",
    description: "Stable runtime behavior with minimal security concerns",
  },
];

const explanation = [
  {
    title: "Critical Security Issues",
    description:
      "The overall risk score is significantly impacted by 3 critical vulnerabilities in authentication and data handling modules. These should be prioritized for immediate remediation.",
    impact: "high",
  },
  {
    title: "Code Complexity Concerns",
    description:
      "Several functions exceed recommended complexity thresholds, particularly in payment processing and report generation modules. This increases maintenance risk and likelihood of bugs.",
    impact: "medium",
  },
  {
    title: "Positive Runtime Metrics",
    description:
      "Dynamic analysis shows stable runtime behavior with good resource utilization and no suspicious file or network access patterns.",
    impact: "low",
  },
];

function CircularProgress({ score, max }: { score: number; max: number }) {
  const percentage = (score / max) * 100;
  const circumference = 2 * Math.PI * 120;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 70) return "#10B981";
    if (percentage >= 40) return "#F59E0B";
    return "#DC2626";
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="280" height="280" className="-rotate-90">
        <circle
          cx="140"
          cy="140"
          r="120"
          stroke="#E2E8F0"
          strokeWidth="16"
          fill="none"
        />
        <circle
          cx="140"
          cy="140"
          r="120"
          stroke={getColor()}
          strokeWidth="16"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-6xl font-bold text-slate-900">{score}</span>
        <span className="text-sm text-slate-500">out of {max}</span>
      </div>
    </div>
  );
}

export function RiskScoring() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Risk Scoring</h2>
        <p className="text-sm text-slate-500 mt-1">
          Overall security and quality assessment
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Overall Score */}
        <Card className="col-span-1 border-slate-200">
          <CardContent className="p-8 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">
              Overall Risk Score
            </h3>
            <CircularProgress score={riskScore} max={maxScore} />
            <Badge
              variant="outline"
              className="mt-6 bg-yellow-50 text-yellow-700 border-yellow-200"
            >
              Moderate Risk
            </Badge>
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        <Card className="col-span-2 border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {scoreBreakdown.map((item, index) => {
              const Icon = item.icon;
              const percentage = (item.score / item.max) * 100;

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 rounded-lg ${
                          item.color === "red"
                            ? "bg-red-100"
                            : item.color === "yellow"
                            ? "bg-yellow-100"
                            : "bg-green-100"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 ${
                            item.color === "red"
                              ? "text-red-600"
                              : item.color === "yellow"
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {item.category}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-slate-900">
                      {item.score}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.color === "red"
                          ? "bg-red-500"
                          : item.color === "yellow"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* AI Explanation */}
      <Card className="border-slate-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-base">Why This Score?</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {explanation.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-100"
            >
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  item.impact === "high"
                    ? "bg-red-100"
                    : item.impact === "medium"
                    ? "bg-yellow-100"
                    : "bg-green-100"
                }`}
              >
                <AlertTriangle
                  className={`w-4 h-4 ${
                    item.impact === "high"
                      ? "text-red-600"
                      : item.impact === "medium"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-slate-900">{item.title}</h4>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      item.impact === "high"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : item.impact === "medium"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : "bg-green-50 text-green-700 border-green-200"
                    }`}
                  >
                    {item.impact} impact
                  </Badge>
                </div>
                <p className="text-sm text-slate-700">{item.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Recommended Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold shrink-0">
                1
              </span>
              <div>
                <p className="font-medium text-slate-900">
                  Address Critical Vulnerabilities
                </p>
                <p className="text-sm text-slate-600">
                  Fix SQL injection, hardcoded credentials, and session encryption issues
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold shrink-0">
                2
              </span>
              <div>
                <p className="font-medium text-slate-900">
                  Refactor Complex Functions
                </p>
                <p className="text-sm text-slate-600">
                  Break down payment processing and report generation modules
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold shrink-0">
                3
              </span>
              <div>
                <p className="font-medium text-slate-900">
                  Implement Comprehensive Testing
                </p>
                <p className="text-sm text-slate-600">
                  Add unit tests for authentication and data validation modules
                </p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
