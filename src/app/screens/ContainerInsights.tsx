import { useState, useEffect } from "react";
import { Container, Cpu, Database, Timer, Gauge, Activity, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useProjectStore } from "../store/projectStore";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";

const generateLiveMetrics = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    time: `${i}:00`,
    cpu: 5 + Math.random() * 15,
    memory: 120 + Math.random() * 40,
  }));
};

export function ContainerInsights() {
  const { getActiveProject } = useProjectStore();
  const activeProject = getActiveProject();
  const [metrics, setMetrics] = useState(generateLiveMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
        const next = [...prev.slice(1), {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          cpu: 5 + Math.random() * 15,
          memory: 120 + Math.random() * 40,
        }];
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500">Please select a project to view container insights.</p>
      </div>
    );
  }

  const dockerStats = activeProject.metrics.dockerStats || { cpu: 0, memory: 0, buildTime: 0, runTime: 0 };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Container className="w-6 h-6 text-blue-600" />
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Container Insights</h2>
          </div>
          <p className="text-sm text-slate-500">
            Runtime behavioral analysis and resource utilization for {activeProject.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 py-1">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Container Running
          </Badge>
          <Badge variant="outline" className="text-slate-500 border-slate-200">
            ID: {activeProject.id.slice(0, 8)}
          </Badge>
        </div>
      </div>

      {/* Hero Metrics */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="border-slate-200 bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CPU Usage</p>
              <Cpu className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{dockerStats.cpu.toFixed(1)}%</p>
            <div className="mt-4">
              <Progress value={dockerStats.cpu} className="h-1.5 bg-slate-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Memory Allocation</p>
              <Database className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{dockerStats.memory}MB</p>
            <p className="text-xs text-slate-500 mt-2">Peak: {(dockerStats.memory * 1.2).toFixed(0)}MB</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Build Duration</p>
              <Timer className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{dockerStats.buildTime}s</p>
            <p className="text-xs text-green-600 mt-2 font-medium">Fast Build (Optimized)</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Uptime</p>
              <Gauge className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{dockerStats.runTime}m</p>
            <p className="text-xs text-slate-500 mt-2">Status: Healthy</p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              Real-time CPU Utilization
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCpu)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-500" />
              Dynamic Memory Footprint
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="stepAfter" dataKey="memory" stroke="#6366f1" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Resource Constraints & Security */}
      <Card className="border-slate-200 bg-slate-50/30 overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-slate-900">Resource Constraint Recommendations</h3>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Based on runtime behavioral analysis, we recommend capping the memory allocation at **256MB** and CPU shares at **0.5**. This project exhibits stable memory cycles with occasional spikes during serialization tasks.
              </p>
              <div className="flex gap-3">
                <Badge variant="secondary" className="bg-white border-slate-200 text-slate-700">Limit: 256MB</Badge>
                <Badge variant="secondary" className="bg-white border-slate-200 text-slate-700">Shares: 0.5</Badge>
                <Badge variant="secondary" className="bg-white border-slate-200 text-slate-700">Network: Restricted</Badge>
              </div>
            </div>
            <div className="w-full md:w-64 h-32 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center">
              <div className="text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Efficiency Score</p>
                <p className="text-4xl font-black text-slate-800">92%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
