import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, ShieldOff, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useProjectStore } from "../store/projectStore";

const complexityTrend = [
  { date: "Day 1", complexity: 12 },
  { date: "Day 2", complexity: 15 },
  { date: "Day 3", complexity: 14 },
  { date: "Day 4", complexity: 18 },
  { date: "Day 5", complexity: 16 },
  { date: "Day 6", complexity: 14 },
];

export function Complexity() {
  const { getActiveProject } = useProjectStore();
  const activeProject = getActiveProject();

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 animate-in fade-in duration-700 text-left">
        <div className="p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
          <ShieldOff className="w-16 h-16 text-slate-300 mx-auto" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight text-center">No Active Workspace</h2>
          <p className="text-sm text-slate-500 font-medium italic text-center">Select a repository to calculate cyclomatic metrics.</p>
        </div>
      </div>
    );
  }

  const metrics = activeProject.metrics;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 text-left text-left">
      <div className="text-left text-left text-left">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 text-left text-left text-left">Code Complexity</h2>
        <p className="text-sm font-medium text-slate-500 mt-1 text-left text-left text-left text-left">
          Analysis of logical branching and maintenance debt for <span className="text-blue-600 font-bold">{activeProject.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <Card className="border-slate-200 shadow-sm text-left">
          <CardContent className="p-6 text-left">
            <div className="flex items-center gap-4 text-left">
              <div className="p-3 bg-blue-50 rounded-xl text-left text-left text-left">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left text-left">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left text-left">Avg Complexity</p>
                <p className="text-lg font-bold text-slate-900 text-left text-left">{metrics.avgComplexity.toFixed(1)} <span className="text-xs font-semibold text-slate-400 text-left uppercase tracking-widest pl-2">Mnt_Index</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm text-left text-left">
          <CardContent className="p-6 text-left">
            <div className="flex items-center gap-4 text-left">
              <div className="p-3 bg-slate-50 rounded-xl text-left text-left text-left">
                <TrendingUp className="w-5 h-5 text-slate-600" />
              </div>
              <div className="text-left text-left">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left text-left">Risk Factor</p>
                <p className="text-lg font-bold text-slate-900 text-left text-left">LOW <span className="text-xs font-semibold text-green-500 text-left uppercase tracking-widest pl-2">STABLE</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm text-left text-left">
          <CardContent className="p-6 text-left">
            <div className="flex items-center gap-4 text-left">
              <div className="p-3 bg-slate-50 rounded-xl text-left text-left">
                <Activity className="w-5 h-5 text-slate-400" />
              </div>
              <div className="text-left text-left text-left">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left text-left text-left">Cyclomatic Hit</p>
                <p className="text-lg font-bold text-slate-900 text-left text-left">42 <span className="text-xs font-semibold text-slate-400 text-left uppercase tracking-widest pl-2">Branches</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left text-left text-left">
        <Card className="border-slate-200 shadow-sm text-left">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-700 text-left text-left text-left">Logical Branching Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-left">
            <div className="h-[280px] w-full text-left font-sans">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={complexityTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                  />
                  <Tooltip 
                    contentStyle={{ border: 'none', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="complexity" 
                    stroke="#2563EB" 
                    strokeWidth={2} 
                    dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm text-left text-left">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-700 text-left text-left text-left">High-Risk Function Matrix</CardTitle>
          </CardHeader>
          <CardContent className="p-0 text-left text-left text-left">
            <div className="divide-y divide-slate-100 text-left">
              {[
                { name: "handleAuthentication", score: 24, file: "authService.ts" },
                { name: "processImagePipeline", score: 18, file: "imageUtil.ts" },
                { name: "syncUserMetadata", score: 15, file: "syncWorker.ts" },
              ].map((fn, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between text-left text-left">
                  <div className="text-left text-left">
                    <p className="text-sm font-bold text-slate-900 text-left">{fn.name}</p>
                    <p className="text-xs text-slate-500 font-medium text-left">{fn.file}</p>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                      fn.score > 20 ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                    }`}>
                      Score: {fn.score}
                    </span>
                    {fn.score > 20 ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-slate-50/50 text-left text-left text-left text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Refactoring Advice</p>
                <p className="text-xs text-slate-600 font-medium leading-relaxed mt-2 text-left">
                    Functions with a score {'>'} 20 should be decomposed to improve testability and reduce the surface area for logic vulnerabilities.
                </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
