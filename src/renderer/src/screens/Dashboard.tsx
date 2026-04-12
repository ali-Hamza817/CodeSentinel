import { 
  FileCode, 
  Shield, 
  BarChart3, 
  CheckCircle, 
  Sparkles, 
  BrainCircuit, 
  Activity, 
  Lock 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useProjectStore } from "../store/projectStore";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";

export function Dashboard() {
  const { 
    projects, 
    activeProjectId, 
    reScanProject,
    addProject,
    updateProject,
    scanProgress, 
    scanningFile,
    estimatedRemainingSeconds 
  } = useProjectStore();
  
  const activeProject = projects.find(p => p.id === activeProjectId);

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 animate-in fade-in duration-700">
        <div className="p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <Shield className="w-16 h-16 text-slate-300 mx-auto" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight text-center">No Active Workspace</h2>
          <p className="text-sm text-slate-500 font-medium text-center">Please select or connect a repository to generate analytics.</p>
        </div>
      </div>
    );
  }

  const metrics = activeProject.metrics;
  const findings = activeProject.findings || [];
  const isScanning = activeProject.status === 'scanning' || activeProject.status === 'cloning';
  const isFailed = activeProject.status === 'failed';

  // Self-healing deep audit: re-clone if path is missing
  const handleDeepAudit = async () => {
    if (!activeProject.path) {
      // No local path — need to clone first then scan
      try {
        updateProject(activeProject.id, { status: 'cloning' });
        const cloneData = await (window as any).api.cloneRepo(activeProject.url);
        updateProject(activeProject.id, { path: cloneData.localPath, status: 'scanning' });
        await reScanProject(activeProject.id);
      } catch (err: any) {
        updateProject(activeProject.id, { status: 'failed' });
        alert(`Clone failed: ${err?.message || 'Unknown error'}. Check the repo URL.`);
      }
    } else {
      reScanProject(activeProject.id);
    }
  };

  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const highCount = findings.filter(f => f.severity === 'high').length;
  const mediumCount = findings.filter(f => f.severity === 'medium').length;
  const lowCount = findings.filter(f => f.severity === 'low' || f.severity === 'info').length;

  const vulnerabilityData = [
    { name: "Critical", value: criticalCount, color: "#ef4444" },
    { name: "High", value: highCount, color: "#f97316" },
    { name: "Medium", value: mediumCount, color: "#eab308" },
    { name: "Low", value: lowCount, color: "#22c55e" },
  ].filter(d => d.value > 0);

  if (vulnerabilityData.length === 0) {
      vulnerabilityData.push({ name: "Secure", value: 1, color: "#22c55e" });
  }

  const statsCards = [
    {
      title: "Total Files",
      value: (metrics?.totalFiles || 0).toLocaleString(),
      label: "Project Volume",
      icon: FileCode,
      color: "blue",
    },
    {
      title: "Vulnerabilities",
      value: (findings.length).toString(),
      label: "Risk Factors",
      icon: Shield,
      color: "red",
    },
    {
      title: "Avg Complexity",
      value: (metrics?.avgComplexity || 0).toFixed(1),
      label: "Logic Depth",
      icon: BarChart3,
      color: "yellow",
    },
    {
      title: "Build Status",
      value: metrics?.buildStatus || "Standby",
      label: "CI Pipeline",
      icon: CheckCircle,
      color: "green",
    },
  ];

  const aiInsights = findings
    .filter(f => f.type?.startsWith('AI:'))
    .slice(0, 3);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-start justify-between">
        <div className="text-left">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 text-left">{activeProject.name} Dashboard</h2>
          <p className="text-sm font-medium text-slate-500 mt-1 text-left">
            Real-time security analytics and performance monitoring
          </p>
        </div>
        <div className="flex items-center gap-4">
             <Button 
                onClick={handleDeepAudit}
                disabled={isScanning}
                className={`text-white text-xs font-bold h-9 px-4 gap-2 shadow-lg ${
                  isFailed ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 
                  'bg-purple-600 hover:bg-purple-700 shadow-purple-100'
                }`}
             >
                {isScanning ? (
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        {activeProject.status === 'cloning' ? 'CLONING...' : 'REASONING...'}
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        {isFailed ? 'RETRY AUDIT' : 'DEEP AUDIT'}
                    </div>
                )}
             </Button>
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-1 text-slate-400 border-slate-200 text-xs font-semibold">
                    Lumina Engine v4.0
                </Badge>
                <Badge variant="outline" className="px-3 py-1 text-slate-400 border-slate-200 text-xs font-semibold">
                    Updated: {activeProject.lastScanned}
                </Badge>
            </div>
        </div>
      </div>

      {scanProgress > 0 && scanProgress < 100 && (
        <Card className="border-blue-200 bg-blue-50/5 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 border-4 border-slate-100 rounded-full" />
                  <div 
                    className="absolute inset-0 border-4 border-blue-600 rounded-full transition-all duration-700" 
                    style={{ clipPath: `inset(0 0 0 0)`, transform: `rotate(${scanProgress * 3.6}deg)` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-[10px] text-blue-600">
                    {scanProgress}%
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logic Reasoning Score</p>
                  <p className="text-sm font-bold text-slate-700 truncate max-w-[300px]">{scanningFile}</p>
                </div>
              </div>
              
              {estimatedRemainingSeconds !== null && (
                <div className="text-right">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Estimated Finish</p>
                  <p className="text-lg font-mono font-bold text-slate-800">
                    {Math.floor(estimatedRemainingSeconds / 60)}:{(estimatedRemainingSeconds % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              )}
            </div>
            
            <Progress value={scanProgress} className="h-1.5 bg-slate-100" indicatorClassName="bg-blue-600" />
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-slate-200 shadow-sm overflow-hidden text-left">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 text-left">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-left">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900 text-left">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${
                      stat.color === "blue" ? "bg-blue-50 text-blue-600" :
                      stat.color === "red" ? "bg-red-50 text-red-600" :
                      stat.color === "yellow" ? "bg-yellow-50 text-yellow-600" : "bg-green-50 text-green-600"
                    }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-slate-200 shadow-sm overflow-hidden text-left">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <CardTitle className="text-sm font-bold text-slate-700 text-left">Vulnerability Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={vulnerabilityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        innerRadius={60}
                        outerRadius={90}
                        dataKey="value"
                        paddingAngle={5}
                        >
                        {vulnerabilityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
             <div className="flex justify-center gap-6 mt-4">
                {vulnerabilityData.map(d => (
                    <div key={d.name} className="flex items-center gap-2 text-left text-left">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-xs font-semibold text-slate-500">{d.name}</span>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white text-left">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                <div className="flex items-center gap-2 text-left">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <CardTitle className="text-sm font-bold text-slate-700 text-left">Llama3 AI Insights</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-left">
            {aiInsights.length > 0 ? (
                aiInsights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors text-left">
                        <div className={`p-2 rounded-lg h-fit ${
                             insight.severity === 'critical' ? 'bg-red-50 text-red-600' :
                             insight.severity === 'high' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                            <BrainCircuit className="w-4 h-4" />
                        </div>
                        <div className="space-y-1 text-left">
                            <p className="text-sm font-bold text-slate-900 text-left">{insight.title.replace('AI: ', '')}</p>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium text-left">
                                {insight.description.replace('[DEEP REASONING] ', '').slice(0, 140)}...
                            </p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="py-12 flex flex-col items-center justify-center space-y-4 opacity-50 text-left">
                     <BrainCircuit className="w-10 h-10 text-slate-300 mx-auto" />
                     <p className="text-sm font-medium text-slate-400 text-center">Awaiting deep AI reasoning results...</p>
                </div>
            )}
            
            {findings.length > 0 && (
                <div className="pt-4 mt-4 border-t border-slate-100 text-left">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left">Security Summary</p>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed font-medium text-left">
                        Lumina-White audit identified {findings.length} total risk vectors. 
                        {criticalCount > 0 ? ` Found ${criticalCount} critical logic flaws requiring immediate review.` : ' The project architecture exhibits a strong security posture from initial heuristic pass.'}
                    </p>
                </div>
            )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
