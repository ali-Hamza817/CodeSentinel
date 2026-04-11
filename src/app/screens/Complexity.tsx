import { BarChart3, TrendingUp, Zap, Box, Activity, ShieldCheck, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { useProjectStore } from "../store/projectStore";
import { Badge } from "../components/ui/badge";

const radarData = [
  { subject: 'Modularity', A: 85, fullMark: 100 },
  { subject: 'Decoupling', A: 70, fullMark: 100 },
  { subject: 'Testability', A: 90, fullMark: 100 },
  { subject: 'Maintainability', A: 65, fullMark: 100 },
  { subject: 'Readability', A: 80, fullMark: 100 },
  { subject: 'Security', A: 75, fullMark: 100 },
];

const complexityTrend = [
  { name: 'v1.0', value: 12 },
  { name: 'v1.1', value: 18 },
  { name: 'v1.2', value: 15 },
  { name: 'v1.3', value: 22 },
  { name: 'v1.4', value: 20 },
  { name: 'v1.5', value: 25 },
];

const functionData = [
  { name: "processPayment", complexity: 28, risk: "high", file: "payment.ts" },
  { name: "validateUser", complexity: 22, risk: "high", file: "auth.ts" },
  { name: "generateReport", complexity: 18, risk: "medium", file: "reports.ts" },
  { name: "updateProfile", complexity: 15, risk: "medium", file: "users.ts" },
  { name: "sendEmail", complexity: 12, risk: "low", file: "email.ts" },
];

export function Complexity() {
  const { getActiveProject } = useProjectStore();
  const activeProject = getActiveProject();

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500">No active project selected. Please select or add a project.</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 bg-slate-50/30">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Complexity Index</h2>
          </div>
          <p className="text-sm text-slate-500">
            Structural health analysis and code maintainability reporting for {activeProject.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-blue-600 text-white border-none px-3 py-1 shadow-sm">
            Grade: A
          </Badge>
          <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 shadow-sm">
            Halstead Metric: 2.4k
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Map */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-base flex items-center gap-2 font-bold text-slate-800">
              <Activity className="w-4 h-4 text-blue-500" />
              Architectural Health Radar
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                  <Radar
                    name="Project Stats"
                    dataKey="A"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.4}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Small Stats Container */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Box className="w-5 h-5 text-indigo-500" />
                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-none font-bold">Stable</Badge>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{activeProject.metrics.avgComplexity.toFixed(1)}</p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Cyclomatic Average</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Your code maintains a healthy modularity ratio. High values in specific modules may indicate "God Objects".
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Zap className="w-5 h-5 text-amber-500" />
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-none font-bold">+12.4%</Badge>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">84.2%</p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Maintainability Index</p>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 w-[84%]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-600/10 shadow-lg shadow-blue-50/50 bg-blue-600 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-125" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-5 h-5 text-blue-200" />
                <h4 className="font-bold tracking-tight">Q1 Journal Insight</h4>
              </div>
              <p className="text-sm text-blue-50/90 leading-relaxed font-medium">
                "Technical debt is below the industry average of 15% for projects of similar scale (1k+ files)."
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Function Analysis */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-400" />
              Critical Path Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {functionData.map((func, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-sm text-slate-900 truncate">
                        {func.name}()
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-bold px-1.5 py-0 ${
                          func.risk === "high"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : func.risk === "medium"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-green-50 text-green-700 border-green-200"
                        }`}
                      >
                        {func.risk} risk
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">{func.file}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-xl font-black ${
                        func.risk === "high" ? "text-red-600" : func.risk === "medium" ? "text-amber-600" : "text-green-600"
                      }`}>{func.complexity}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Historical Evolution */}
        <Card className="border-slate-200 shadow-sm bg-white flex flex-col">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Evolution Trend
              </CardTitle>
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Complexity</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col justify-center">
            <div className="h-[280px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={complexityTrend}>
                  <defs>
                    <linearGradient id="trendColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} hide />
                  <YAxis hide domain={[0, 40]} />
                  <Tooltip 
                     contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#trendColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200/50">
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "Structural erosion detected between v1.3 and v1.5. Architectural decay is trending towards 'Maintenance Heavy' state."
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Internal mock component for Terminal icon which was missing from lucide imports in thinking
function Terminal({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="4 17 10 11 4 5"></polyline>
      <line x1="12" y1="19" x2="20" y2="19"></line>
    </svg>
  );
}
