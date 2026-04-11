import { useState } from "react";
import { Play, Activity, Cpu, HardDrive, Network, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const cpuData = [
  { time: "0s", usage: 12 },
  { time: "2s", usage: 24 },
  { time: "4s", usage: 45 },
  { time: "6s", usage: 38 },
  { time: "8s", usage: 52 },
  { time: "10s", usage: 31 },
  { time: "12s", usage: 28 },
];

const memoryData = [
  { time: "0s", usage: 128 },
  { time: "2s", usage: 156 },
  { time: "4s", usage: 198 },
  { time: "6s", usage: 245 },
  { time: "8s", usage: 289 },
  { time: "10s", usage: 312 },
  { time: "12s", usage: 298 },
];

const executionLogs = [
  { time: "00:00:01", level: "info", message: "Starting application..." },
  { time: "00:00:02", level: "info", message: "Connecting to database..." },
  { time: "00:00:03", level: "success", message: "Database connected successfully" },
  { time: "00:00:04", level: "info", message: "Initializing routes..." },
  { time: "00:00:05", level: "warning", message: "Deprecated API detected in auth module" },
  { time: "00:00:06", level: "info", message: "Server listening on port 3000" },
  { time: "00:00:07", level: "info", message: "Processing request: GET /api/users" },
  { time: "00:00:08", level: "error", message: "Unhandled exception in payment processor" },
];

const fileAccessLogs = [
  { file: "/etc/passwd", action: "read", status: "blocked" },
  { file: "/app/config.json", action: "read", status: "allowed" },
  { file: "/tmp/output.log", action: "write", status: "allowed" },
  { file: "/var/secrets/key.pem", action: "read", status: "blocked" },
];

const networkCalls = [
  { endpoint: "api.stripe.com", method: "POST", status: "200" },
  { endpoint: "db.internal.com", method: "GET", status: "200" },
  { endpoint: "suspicious-domain.com", method: "GET", status: "blocked" },
];

export function DynamicAnalysis() {
  const [isRunning, setIsRunning] = useState(false);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Dynamic Analysis
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Runtime execution and behavior monitoring
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Environment:</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Node.js 18
            </Badge>
          </div>
          <Button
            onClick={() => setIsRunning(!isRunning)}
            className={isRunning ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
          >
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? "Stop Sandbox" : "Run in Sandbox"}
          </Button>
        </div>
      </div>

      {/* Runtime Metrics */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-base">CPU Usage</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={cpuData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="usage"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={{ fill: "#2563EB", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-slate-600">Current</span>
              <span className="text-lg font-semibold text-slate-900">28%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-base">Memory Usage</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={memoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="usage"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: "#10B981", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-slate-600">Current</span>
              <span className="text-lg font-semibold text-slate-900">298 MB</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Execution Logs */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-base">Execution Logs</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm space-y-1 max-h-64 overflow-y-auto">
            {executionLogs.map((log, index) => (
              <div key={index} className="flex gap-3">
                <span className="text-slate-500">{log.time}</span>
                <span
                  className={
                    log.level === "error"
                      ? "text-red-400"
                      : log.level === "warning"
                      ? "text-yellow-400"
                      : log.level === "success"
                      ? "text-green-400"
                      : "text-blue-400"
                  }
                >
                  [{log.level.toUpperCase()}]
                </span>
                <span className="text-slate-300">{log.message}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Monitoring */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-base">File Access Logs</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {fileAccessLogs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {log.file}
                    </p>
                    <p className="text-xs text-slate-500">{log.action}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      log.status === "blocked"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-green-50 text-green-700 border-green-200"
                    }`}
                  >
                    {log.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-base">Network Calls</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {networkCalls.map((call, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {call.endpoint}
                    </p>
                    <p className="text-xs text-slate-500">{call.method}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      call.status === "blocked"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-green-50 text-green-700 border-green-200"
                    }`}
                  >
                    {call.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
