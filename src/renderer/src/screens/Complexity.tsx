import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  ShieldOff, 
  Activity, 
  ChevronRight, 
  Zap,
  Info,
  ShieldAlert,
  Flame,
  ArrowUpRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { useProjectStore } from "../store/projectStore";
import { Badge } from "../components/ui/badge";

// Simulated historical growth trend — in a real app this would come from a DB
const complexityTrend = [
  { date: "Day 1", complexity: 8, branches: 12 },
  { date: "Day 2", complexity: 12, branches: 24 },
  { date: "Day 3", complexity: 15, branches: 32 },
  { date: "Day 4", complexity: 14, branches: 28 },
  { date: "Day 5", complexity: 19, branches: 45 },
  { date: "Current", complexity: 22, branches: 54 },
];

export function Complexity() {
  const { getActiveProject } = useProjectStore();
  const activeProject = getActiveProject();

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 animate-in fade-in duration-700 text-left">
        <div className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
          <ShieldOff className="w-16 h-16 text-slate-200 mx-auto" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Identity Needed</h2>
          <p className="text-sm text-slate-500 font-medium max-w-[320px] leading-relaxed italic">
            Select a project workspace to activate live cyclomatic telemetry.
          </p>
        </div>
      </div>
    );
  }

  const metrics = activeProject.metrics;
  const highRiskFns = metrics.highRiskFunctions || [];
  
  // Dynamic Risk Calculation
  const avgCC = metrics.avgComplexity || 0;
  const isHighRisk = avgCC > 15;
  const isCritical = avgCC > 25;
  
  const riskLabel = isCritical ? "CRITICAL" : isHighRisk ? "ELEVATED" : "LOW";
  const riskStatus = isCritical ? "UNSTABLE" : isHighRisk ? "DEGRADING" : "STABLE";
  const riskColor = isCritical ? "text-red-600" : isHighRisk ? "text-orange-500" : "text-emerald-500";

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-1000 bg-[#FAFAFB] min-h-full font-sans">
      {/* Dynamic Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
             <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 font-bold text-[10px] px-3 py-1 uppercase tracking-wider">Logic Intelligence</Badge>
             <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 rounded-full border border-green-100 shadow-sm">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-bold text-green-700 uppercase">Live Engine Active</span>
             </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 text-left">
             Cyclomatic Architecture
          </h2>
          <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-2xl text-left">
            Real-time analysis of branching pathways and cognitive complexity for <span className="text-indigo-600 font-bold decoration-indigo-200 decoration-2 underline underline-offset-4">{activeProject.name}</span>
          </p>
        </div>
        
        <div className="text-right flex flex-col items-end gap-1">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Telemetry Scan</span>
           <span className="text-xs font-bold text-slate-900 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-slate-100">{activeProject.lastScanned}</span>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            label: "Avg Complexity", 
            value: avgCC.toFixed(1), 
            sub: "Mnt_Index", 
            icon: BarChart3, 
            color: "text-indigo-600", 
            bg: "bg-indigo-50",
            desc: "Mean pathway density"
          },
          { 
            label: "Risk Factor", 
            value: riskLabel, 
            sub: riskStatus, 
            icon: TrendingUp, 
            color: riskColor, 
            bg: "bg-slate-50",
            desc: "Systemic logic stability"
          },
          { 
            label: "Cyclomatic Hit", 
            value: metrics.totalBranches || 0, 
            sub: "Branches", 
            icon: ShieldAlert, 
            color: "text-slate-900", 
            bg: "bg-slate-50",
            desc: "Atomic decision logic"
          }
        ].map((kpi, idx) => (
          <Card key={idx} className="border-none shadow-[0_5px_15px_rgba(0,0,0,0.03)] bg-white overflow-hidden group hover:translate-y-[-2px] transition-all duration-300">
            <CardContent className="p-6 relative">
              <div className="absolute -top-4 -right-4 p-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                 <kpi.icon className="w-20 h-20" />
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 ${kpi.bg} rounded-xl shadow-sm`}>
                    <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-2xl font-bold tracking-tight ${kpi.color}`}>
                       {kpi.value}
                    </p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{kpi.sub}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                     <p className="text-[9px] font-medium text-slate-400 italic tracking-wide">{kpi.desc}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Advanced Analysis Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Branching Trend Visualizer */}
        <Card className="lg:col-span-7 border-none shadow-[0_10px_30px_rgba(0,0,0,0.03)] overflow-hidden bg-white">
          <CardHeader className="bg-white border-b border-slate-50 py-6 px-8">
            <div className="flex items-center justify-between">
               <div className="space-y-0.5">
                  <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logical Branching Trend</CardTitle>
                  <p className="text-[10px] font-medium text-slate-400">Evolution of logic density</p>
               </div>
               <Badge className="bg-white text-slate-600 border border-slate-200 font-bold px-2 py-0.5 text-[9px]">REPRODUCTION TELEMETRY</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[280px] w-full font-sans">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={complexityTrend}>
                  <defs>
                    <linearGradient id="colorInd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fill: '#94A3B8', fontWeight: 600 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fill: '#94A3B8', fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: '700' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="complexity" 
                    stroke="#6366F1" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorInd)" 
                    dot={{ fill: '#6366F1', stroke: '#fff', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#6366F1' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic High Risk Matrix */}
        <Card className="lg:col-span-5 border-none shadow-[0_10px_30px_rgba(0,0,0,0.03)] overflow-hidden bg-white flex flex-col">
          <CardHeader className="bg-white border-b border-slate-50 py-6 px-8">
            <div className="space-y-0.5">
               <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">High-Risk Function Matrix</CardTitle>
               <p className="text-[10px] font-medium text-slate-400">Critical hot-spots</p>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto max-h-[340px] custom-scrollbar divide-y divide-slate-50">
              {highRiskFns.length === 0 ? (
                <div className="p-16 flex flex-col items-center justify-center text-center">
                   <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                   <p className="text-[10px] font-bold text-slate-400 uppercase">System Logic Optimized</p>
                </div>
              ) : (
                highRiskFns.map((fn, i) => (
                  <div key={i} className="px-8 py-4 flex items-center justify-between group cursor-default hover:bg-[#F8FAFF] transition-colors">
                    <div className="space-y-1 flex flex-col min-w-0">
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5 text-left truncate">
                         {fn.score > 20 && <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />}
                         {fn.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-medium text-slate-400 uppercase truncate max-w-[100px]">{fn.file}</span>
                        <span className="text-[9px] font-bold text-indigo-400 px-1 py-0.5 bg-indigo-50 rounded">Ln {fn.line}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 shadow-sm ${
                        fn.score > 20 ? "bg-red-50 text-red-700 border-red-100" : "bg-indigo-50 text-indigo-700 border-indigo-100"
                      }`}>
                        <span className="text-[8px] opacity-60">CC</span>
                        {fn.score}
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-200 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* AI Architectural Refactor Advice */}
            <div className="p-8 bg-slate-900 relative overflow-hidden shrink-0 mt-auto">
                <div className="absolute top-0 right-0 p-6 opacity-10 text-yellow-400">
                   <Zap className="w-12 h-12 fill-current" />
                </div>
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-left">Refactoring Advice</p>
                  </div>
                  <p className="text-xs font-medium text-slate-200 leading-relaxed italic text-left">
                      {isCritical 
                        ? "Systemic instability detected. High cyclomatic density detected across core modules. Recommend immediate decomposition."
                        : highRiskFns.length > 0 
                        ? `Module '${highRiskFns[0].name}' CC score exceeds safety baselines. Recommend extracting logical branches.`
                        : "Architecture state is lean. No critical maintenance debt detected."}
                  </p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
