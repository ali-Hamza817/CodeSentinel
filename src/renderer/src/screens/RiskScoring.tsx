import { Shield, BarChart3, Activity, AlertTriangle, Sparkles, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useProjectStore } from "../store/projectStore";

function CircularProgress({ score, max }: { score: number; max: number }) {
  const percentage = (score / max) * 100;
  const circumference = 2 * Math.PI * 120;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 70) return "#10B981"; // Good
    if (percentage >= 40) return "#F59E0B"; // Moderate
    return "#DC2626"; // Critical
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
  const { getActiveProject } = useProjectStore();
  const activeProject = getActiveProject();

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Shield className="w-12 h-12 text-slate-300" />
        <p className="text-slate-500">Select a project to view architectural risk scores.</p>
      </div>
    );
  }

  // Calibration Logic
  const vulnerabilities = activeProject.metrics?.vulnerabilities || 0;
  const totalFiles = activeProject.metrics?.totalFiles || 1;
  const avgComplexity = activeProject.metrics?.avgComplexity || 0;

  // Simple heuristic: Start at 100, subtract for vulnerabilities and complexity
  const vScore = Math.max(0, 100 - (vulnerabilities * 10));
  const cScore = Math.max(0, 100 - (avgComplexity * 5));
  const rScore = activeProject.status === 'completed' ? 95 : 50;

  const overallScore = Math.round((vScore * 0.5) + (cScore * 0.3) + (rScore * 0.2));

  const scoreBreakdown = [
    {
      category: "Vulnerability Score",
      score: vScore,
      max: 100,
      icon: Shield,
      color: vScore < 50 ? "red" : vScore < 80 ? "yellow" : "green",
      description: `${vulnerabilities} security issues identified across ${totalFiles} source files`,
    },
    {
      category: "Complexity Score",
      score: cScore,
      max: 100,
      icon: BarChart3,
      color: cScore < 50 ? "red" : cScore < 80 ? "yellow" : "green",
      description: `Average cyclomatic complexity of ${avgComplexity.toFixed(1)} detected`,
    },
    {
      category: "Analysis Quality",
      score: rScore,
      max: 100,
      icon: Activity,
      color: rScore < 80 ? "yellow" : "green",
      description: activeProject.status === 'completed' ? "Full workspace audit completed successfully" : "Analysis pending or interrupted",
    },
  ];

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { label: "Low Risk", color: "bg-green-50 text-green-700 border-green-200" };
    if (score >= 50) return { label: "Moderate Risk", color: "bg-yellow-50 text-yellow-700 border-yellow-200" };
    return { label: "Critical Risk", color: "bg-red-50 text-red-700 border-red-200" };
  };

  const risk = getRiskLevel(overallScore);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Risk Scoring</h2>
        <p className="text-sm text-slate-500 mt-1">
          Dynamic security and quality assessment for <span className="text-blue-600 font-bold">{activeProject.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 border-slate-200 shadow-sm">
          <CardContent className="p-8 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 uppercase tracking-wider text-xs">
              Project Health Index
            </h3>
            <CircularProgress score={overallScore} max={100} />
            <Badge variant="outline" className={`mt-6 py-1.5 px-4 font-bold ${risk.color}`}>
              {risk.label}
            </Badge>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Component Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {scoreBreakdown.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        item.color === "red" ? "bg-red-50 text-red-600" :
                        item.color === "yellow" ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{item.category}</p>
                        <p className="text-xs text-slate-500 font-medium">{item.description}</p>
                      </div>
                    </div>
                    <span className="text-xl font-black text-slate-900">{item.score}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        item.color === "red" ? "bg-red-500" :
                        item.color === "yellow" ? "bg-amber-500" : "bg-green-500"
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 bg-gradient-to-br from-blue-50/50 to-white shadow-sm overflow-hidden">
        <CardHeader className="border-b border-blue-100 bg-white/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-base font-bold">Lumina reasoning summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="p-4 bg-white rounded-xl border border-blue-100 space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Primary Security Driver
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {vulnerabilities > 0 
                    ? `Our scanners identified ${vulnerabilities} distinct architectural weaknesses. High severity patterns in critical modules are the primary drivers of technical debt.`
                    : "Excellent security posture. No common architectural vulnerabilities were detected in the initial scan."}
                </p>
             </div>
             <div className="p-4 bg-white rounded-xl border border-blue-100 space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  Codebase Scalability
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {avgComplexity > 15 
                    ? `Mean cyclomatic complexity is high (${avgComplexity.toFixed(1)}). This indicates a "Maintenace Heavy" codebase with potential architectural drift.`
                    : `Complexity levels are within healthy limits (${avgComplexity.toFixed(1)}). The codebase is architecturally resilient and maintainable.`}
                </p>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
