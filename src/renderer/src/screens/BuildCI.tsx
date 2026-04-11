import { useState } from "react";
import { Play, CheckCircle, XCircle, Clock, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

const testResults = [
  { name: "Authentication Tests", passed: 24, failed: 0, status: "passed" },
  { name: "API Integration Tests", passed: 18, failed: 2, status: "failed" },
  { name: "Database Tests", passed: 15, failed: 0, status: "passed" },
  { name: "Unit Tests", passed: 142, failed: 1, status: "failed" },
];

const buildLogs = [
  { time: "00:00:01", message: "Installing dependencies..." },
  { time: "00:00:15", message: "Dependencies installed successfully" },
  { time: "00:00:16", message: "Running TypeScript compiler..." },
  { time: "00:00:18", message: "TypeScript compilation completed" },
  { time: "00:00:19", message: "Running tests..." },
  { time: "00:00:32", message: "✓ 199 tests passed" },
  { time: "00:00:32", message: "✗ 3 tests failed" },
  { time: "00:00:33", message: "Building production bundle..." },
  { time: "00:00:45", message: "Build completed with warnings" },
];

export function BuildCI() {
  const [isBuilding, setIsBuilding] = useState(false);
  const totalPassed = testResults.reduce((sum, t) => sum + t.passed, 0);
  const totalFailed = testResults.reduce((sum, t) => sum + t.failed, 0);
  const totalTests = totalPassed + totalFailed;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Build & CI</h2>
          <p className="text-sm text-slate-500 mt-1">
            Automated build and test execution
          </p>
        </div>

        <Button
          onClick={() => setIsBuilding(!isBuilding)}
          disabled={isBuilding}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Play className="w-4 h-4 mr-2" />
          {isBuilding ? "Building..." : "Run Build"}
        </Button>
      </div>

      {/* Build Status */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-slate-500 mb-1">Build Tool</p>
                <p className="text-lg font-semibold text-slate-900">npm</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-slate-500 mb-1">Build Duration</p>
                <p className="text-lg font-semibold text-slate-900">45s</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`${
            totalFailed > 0
              ? "border-red-200 bg-red-50"
              : "border-green-200 bg-green-50"
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              {totalFailed > 0 ? (
                <XCircle className="w-8 h-8 text-red-600" />
              ) : (
                <CheckCircle className="w-8 h-8 text-green-600" />
              )}
              <div>
                <p
                  className={`text-sm mb-1 ${
                    totalFailed > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  Build Status
                </p>
                <p
                  className={`text-lg font-semibold ${
                    totalFailed > 0 ? "text-red-700" : "text-green-700"
                  }`}
                >
                  {totalFailed > 0 ? "Failed" : "Passed"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Test Results</CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-600">
                {totalPassed} / {totalTests} passed
              </span>
              <Badge
                variant="outline"
                className={
                  totalFailed > 0
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-green-50 text-green-700 border-green-200"
                }
              >
                {((totalPassed / totalTests) * 100).toFixed(1)}%
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {testResults.map((test, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  {test.status === "passed" ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium text-slate-900">{test.name}</p>
                    <p className="text-sm text-slate-500">
                      {test.passed + test.failed} tests
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-green-600 font-medium">
                      {test.passed} passed
                    </p>
                  </div>
                  {test.failed > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-red-600 font-medium">
                        {test.failed} failed
                      </p>
                    </div>
                  )}
                  <Badge
                    variant="outline"
                    className={`${
                      test.status === "passed"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {test.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Build Output */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Build Output</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm space-y-1 max-h-80 overflow-y-auto">
            {buildLogs.map((log, index) => (
              <div key={index} className="flex gap-3">
                <span className="text-slate-500">{log.time}</span>
                <span
                  className={
                    log.message.includes("✓")
                      ? "text-green-400"
                      : log.message.includes("✗")
                      ? "text-red-400"
                      : log.message.includes("warning")
                      ? "text-yellow-400"
                      : "text-slate-300"
                  }
                >
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
