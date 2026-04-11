import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const functionData = [
  { name: "processPayment", complexity: 28, risk: "high", file: "payment.ts" },
  { name: "validateUser", complexity: 22, risk: "high", file: "auth.ts" },
  { name: "generateReport", complexity: 18, risk: "medium", file: "reports.ts" },
  { name: "updateProfile", complexity: 15, risk: "medium", file: "users.ts" },
  { name: "sendEmail", complexity: 12, risk: "low", file: "email.ts" },
  { name: "parseJSON", complexity: 8, risk: "low", file: "utils.ts" },
  { name: "formatDate", complexity: 5, risk: "low", file: "utils.ts" },
  { name: "calculateTax", complexity: 14, risk: "medium", file: "billing.ts" },
  { name: "verifyToken", complexity: 19, risk: "medium", file: "auth.ts" },
  { name: "syncDatabase", complexity: 25, risk: "high", file: "database.ts" },
];

const chartData = functionData.slice(0, 10).map((item) => ({
  name: item.name,
  complexity: item.complexity,
  fill:
    item.risk === "high"
      ? "#DC2626"
      : item.risk === "medium"
      ? "#F59E0B"
      : "#10B981",
}));

const fileComplexity = [
  { file: "src/payment.ts", avgComplexity: 24, functions: 12 },
  { file: "src/auth.ts", avgComplexity: 20, functions: 8 },
  { file: "src/database.ts", avgComplexity: 19, functions: 15 },
  { file: "src/reports.ts", avgComplexity: 16, functions: 6 },
  { file: "src/billing.ts", avgComplexity: 13, functions: 9 },
];

export function Complexity() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Cyclomatic Complexity
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Function complexity analysis and risk assessment
        </p>
      </div>

      {/* Chart */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Top Complex Functions</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94A3B8" />
              <YAxis
                type="category"
                dataKey="name"
                width={150}
                tick={{ fontSize: 12 }}
                stroke="#94A3B8"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="complexity" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Function Table */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Function Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {functionData.map((func, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm text-slate-900 truncate">
                        {func.name}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          func.risk === "high"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : func.risk === "medium"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-green-50 text-green-700 border-green-200"
                        }`}
                      >
                        {func.risk}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">{func.file}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-lg font-semibold ${
                        func.risk === "high"
                          ? "text-red-600"
                          : func.risk === "medium"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {func.complexity}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* File Heatmap */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">File-wise Complexity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fileComplexity.map((file, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {file.file}
                      </p>
                      <p className="text-xs text-slate-500">
                        {file.functions} functions
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {file.avgComplexity}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        file.avgComplexity > 20
                          ? "bg-red-500"
                          : file.avgComplexity > 15
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${(file.avgComplexity / 30) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">
                Complexity Thresholds
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-slate-600">Low: 1-10</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-slate-600">Medium: 11-20</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-slate-600">High: 21+</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
