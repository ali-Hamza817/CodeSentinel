import { FileText, Download, Eye, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

const reportSummary = {
  projectName: "ecommerce-platform",
  scanDate: "April 11, 2026",
  totalFiles: 1247,
  riskScore: 42,
  vulnerabilities: {
    critical: 3,
    high: 8,
    medium: 15,
    low: 24,
  },
  complexity: {
    average: 14.2,
    highRisk: 10,
  },
  buildStatus: "Passed",
  testsPassed: 199,
  testsFailed: 3,
};

export function Reports() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Reports</h2>
          <p className="text-sm text-slate-500 mt-1">
            Generate and export analysis reports
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Export Options */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Export Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-6 border-2 border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-slate-900">PDF Report</h3>
              </div>
              <p className="text-sm text-slate-600">
                Comprehensive report with charts and detailed findings
              </p>
            </button>

            <button className="p-6 border-2 border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-slate-900">JSON Export</h3>
              </div>
              <p className="text-sm text-slate-600">
                Machine-readable data for integration and automation
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Report Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white border-2 border-slate-200 rounded-lg p-8 space-y-8">
            {/* Report Header */}
            <div className="border-b border-slate-200 pb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    CodeSentinel Analysis Report
                  </h1>
                  <p className="text-lg text-slate-600">
                    {reportSummary.projectName}
                  </p>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  100% Local Processing
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Calendar className="w-4 h-4" />
                <span>Generated on {reportSummary.scanDate}</span>
              </div>
            </div>

            {/* Executive Summary */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Executive Summary
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-500 mb-1">Total Files</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {reportSummary.totalFiles.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-500 mb-1">Risk Score</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {reportSummary.riskScore}/100
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-500 mb-1">Build Status</p>
                  <p className="text-2xl font-semibold text-green-600">
                    {reportSummary.buildStatus}
                  </p>
                </div>
              </div>
            </div>

            {/* Vulnerabilities */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Security Vulnerabilities
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <span className="font-medium text-red-900">Critical Issues</span>
                  <span className="text-2xl font-semibold text-red-700">
                    {reportSummary.vulnerabilities.critical}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="font-medium text-orange-900">High Issues</span>
                  <span className="text-2xl font-semibold text-orange-700">
                    {reportSummary.vulnerabilities.high}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <span className="font-medium text-yellow-900">Medium Issues</span>
                  <span className="text-2xl font-semibold text-yellow-700">
                    {reportSummary.vulnerabilities.medium}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="font-medium text-green-900">Low Issues</span>
                  <span className="text-2xl font-semibold text-green-700">
                    {reportSummary.vulnerabilities.low}
                  </span>
                </div>
              </div>
            </div>

            {/* Complexity */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Code Complexity
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-500 mb-1">
                    Average Complexity
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {reportSummary.complexity.average}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-500 mb-1">
                    High Risk Functions
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {reportSummary.complexity.highRisk}
                  </p>
                </div>
              </div>
            </div>

            {/* Test Results */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Test Results
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-600 mb-1">Tests Passed</p>
                  <p className="text-2xl font-semibold text-green-700">
                    {reportSummary.testsPassed}
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-600 mb-1">Tests Failed</p>
                  <p className="text-2xl font-semibold text-red-700">
                    {reportSummary.testsFailed}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <p>
                  Generated by CodeSentinel – Secure Local Code Analysis Platform
                </p>
                <p>Powered by Local AI (Ollama) – Privacy Preserved</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
