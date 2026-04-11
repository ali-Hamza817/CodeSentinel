import { FileCode, Shield, BarChart3, CheckCircle, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useProjectStore } from "../store/projectStore";
import { Badge } from "../components/ui/badge";

const complexityData = [
  { date: "Jan", complexity: 12 },
  { date: "Feb", complexity: 15 },
  { date: "Mar", complexity: 11 },
  { date: "Apr", complexity: 18 },
  { date: "May", complexity: 14 },
  { date: "Jun", complexity: 16 },
];

export function Dashboard() {
  const { getActiveProject } = useProjectStore();
  const activeProject = getActiveProject();

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500">No active project selected. Please select or add a project.</p>
      </div>
    );
  }

  const metrics = activeProject?.metrics || {
    totalFiles: 0,
    vulnerabilities: 0,
    avgComplexity: 0,
    buildStatus: 'Pending'
  };

  const vulnerabilityData = [
    { name: "Critical", value: Math.floor((metrics?.vulnerabilities || 0) * 0.1), color: "#DC2626" },
    { name: "High", value: Math.floor((metrics?.vulnerabilities || 0) * 0.2), color: "#F59E0B" },
    { name: "Medium", value: Math.floor((metrics?.vulnerabilities || 0) * 0.3), color: "#FCD34D" },
    { name: "Low", value: Math.floor((metrics?.vulnerabilities || 0) * 0.4), color: "#10B981" },
  ];

  const statsCards = [
    {
      title: "Total Files",
      value: (metrics?.totalFiles || 0).toLocaleString(),
      change: "+0%",
      trend: "stable",
      icon: FileCode,
      color: "blue",
    },
    {
      title: "Vulnerabilities",
      value: (metrics?.vulnerabilities || 0).toString(),
      change: "-0%",
      trend: "stable",
      icon: Shield,
      color: "red",
    },
    {
      title: "Avg Complexity",
      value: (metrics?.avgComplexity || 0).toFixed(1),
      change: "+0%",
      trend: "stable",
      icon: BarChart3,
      color: "yellow",
    },
    {
      title: "Build Status",
      value: metrics?.buildStatus || "Pending",
      change: (metrics?.buildStatus === 'Passed') ? "100%" : "0%",
      trend: "stable",
      icon: CheckCircle,
      color: "green",
    },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{activeProject.name} Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time security analytics and performance monitoring
          </p>
        </div>
        <Badge variant="outline" className="px-4 py-1 text-slate-500 border-slate-200">
          Last Scanned: {activeProject.lastScanned}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? TrendingUp : stat.trend === "down" ? TrendingDown : CheckCircle;

          return (
            <Card key={stat.title} className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">{stat.title}</p>
                    <p className="text-3xl font-semibold text-slate-900">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <TrendIcon
                        className={`w-4 h-4 ${
                          stat.trend === "up"
                            ? "text-red-500"
                            : stat.trend === "down"
                            ? "text-green-500"
                            : "text-green-500"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          stat.trend === "up"
                            ? "text-red-600"
                            : stat.trend === "down"
                            ? "text-green-600"
                            : "text-green-600"
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      stat.color === "blue"
                        ? "bg-blue-100"
                        : stat.color === "red"
                        ? "bg-red-100"
                        : stat.color === "yellow"
                        ? "bg-yellow-100"
                        : "bg-green-100"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        stat.color === "blue"
                          ? "text-blue-600"
                          : stat.color === "red"
                          ? "text-red-600"
                          : stat.color === "yellow"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Cyclomatic Complexity Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={complexityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#94A3B8"
                />
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
                  dataKey="complexity"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={{ fill: "#2563EB", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Vulnerability Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={vulnerabilityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={90}
                  dataKey="value"
                >
                  {vulnerabilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Panel */}
      <Card className="border-slate-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-base">AI Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-700 leading-relaxed">
            Your codebase shows good overall health with an average complexity score of 14.2.
            However, 3 critical vulnerabilities were detected in authentication modules that require immediate attention.
          </p>
          <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-blue-100">
            <Shield className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-900">
                Security Recommendation
              </p>
              <p className="text-sm text-slate-600">
                Update authentication middleware to implement proper session token encryption
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-blue-100">
            <BarChart3 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-900">
                Complexity Alert
              </p>
              <p className="text-sm text-slate-600">
                15 functions exceed complexity threshold. Consider refactoring for maintainability
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
