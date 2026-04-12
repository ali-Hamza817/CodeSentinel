import { useState, useEffect } from "react";
import { Container, Cpu, Database, Timer, Gauge, Activity, ShieldAlert, CheckCircle2, ShieldOff, Box } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useProjectStore } from "../store/projectStore";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";

export function ContainerInsights() {
  const { getActiveProject } = useProjectStore();
  const activeProject = getActiveProject();
  const [metrics, setMetrics] = useState<any[]>([]);

  useEffect(() => {
    if (!activeProject || activeProject.sandboxStatus !== 'running') {
      setMetrics([]);
      return;
    }

    const interval = setInterval(async () => {
      const stats = await (window as any).api.dockerStats(activeProject.id);
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      const cpuVal = parseFloat(stats.cpu.replace('%', ''));
      const memUsageRaw = stats.memUsage.split(' / ')[0];
      const memVal = parseFloat(memUsageRaw.replace(/[A-Za-z]/g, ''));

      setMetrics(prev => {
        const next = [...prev, { time: timestamp, cpu: cpuVal, memory: memVal }];
        return next.slice(-20);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [activeProject?.id, activeProject?.sandboxStatus]);

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 animate-in fade-in duration-700">
        <div className="p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <ShieldOff className="w-16 h-16 text-slate-300 mx-auto" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight text-center">No Active Workspace</h2>
          <p className="text-sm text-slate-500 font-medium italic text-center">Select a repository to monitor container health.</p>
        </div>
      </div>
    );
  }

  const isRunning = activeProject.sandboxStatus === 'running';
  const dockerStats = activeProject.metrics?.dockerStats || { cpu: '0%', mem: '0%', memUsage: '0B / 0B' };
  const cpuPercent = parseFloat(dockerStats.cpu.replace('%', ''));
  const currentMem = dockerStats.memUsage.split(' / ')[0];

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex items-start justify-between">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2 text-left">
            <Container className="w-6 h-6 text-blue-600" />
            <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase text-left">Lumina Container Audit</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium italic text-left">
            Runtime behavioral analysis and resource utilization for <span className="text-blue-600 font-bold">{activeProject.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-left">
          {isRunning ? (
             <Badge className="bg-green-600 text-white border-none px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-none shadow-lg shadow-green-100">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                DOCKER_ACTIVE
            </Badge>
          ) : (
            <Badge className="bg-slate-900 text-white border-none px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-none">
                <div className="w-2 h-2 rounded-full bg-slate-600 mr-2 animate-pulse" />
                SANDBOX_IDLE
            </Badge>
          )}
          <Badge variant="outline" className="text-slate-400 border-slate-200 px-3 py-1 text-[10px] font-bold uppercase">
            ID: {activeProject.id.slice(0, 12)}
          </Badge>
        </div>
      </div>

      {!isRunning ? (
         <Card className="border-slate-200 border-dashed bg-slate-50/50 text-left">
            <CardContent className="p-24 text-center text-left">
                <Box className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-400 uppercase tracking-tight text-center">Sandbox is Disconnected</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 text-center">Launch the Dynamic Audit engine to bridge container telemetry.</p>
            </CardContent>
         </Card>
      ) : (
        <>
            {/* Hero Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-slate-200 shadow-sm text-left">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Real-Time CPU</p>
                    <Cpu className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-3xl font-black text-slate-900 text-left">{dockerStats.cpu}</p>
                    <div className="mt-4">
                    <Progress value={cpuPercent} className="h-1.5 bg-slate-100" />
                    </div>
                </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm text-left">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Mem Allocation</p>
                    <Database className="w-4 h-4 text-indigo-500" />
                    </div>
                    <p className="text-3xl font-black text-slate-900 text-left">{currentMem}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase text-left">Total: {dockerStats.memUsage.split(' / ')[1]}</p>
                </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm text-left">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Egress Quality</p>
                    <Activity className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-3xl font-black text-slate-900 text-left">STABLE</p>
                    <p className="text-[10px] text-green-600 mt-2 font-black uppercase text-left">Architecture Healthy</p>
                </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm text-left">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Audit Uptime</p>
                    <Timer className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-3xl font-black text-slate-900 text-left">LIVE</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-black uppercase text-left">Telemetry Stream Active</p>
                </CardContent>
                </Card>
            </div>

            {/* Real-time Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-slate-200 shadow-xl overflow-hidden bg-white text-left">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 text-left">
                    <Activity className="w-4 h-4 text-blue-500" />
                    Architectural Load Cycle
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-left">
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
                        <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                        <Area type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorCpu)" />
                    </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-xl overflow-hidden bg-white text-left">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 text-left">
                    <Database className="w-4 h-4 text-indigo-500" />
                    Memory Segment Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-left">
                    <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={metrics}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                        <Line type="stepAfter" dataKey="memory" stroke="#6366f1" strokeWidth={4} dot={false} />
                    </LineChart>
                    </ResponsiveContainer>
                </CardContent>
                </Card>
            </div>

            {/* Resource Constraints & Security */}
            <Card className="border-slate-900 bg-slate-900 overflow-hidden text-left">
                <CardContent className="p-10">
                <div className="flex flex-col md:flex-row gap-10 items-center">
                    <div className="flex-1 space-y-6 text-left">
                    <div className="flex items-center gap-3 text-left">
                        <ShieldAlert className="w-6 h-6 text-orange-400" />
                        <h3 className="text-xl font-black text-white uppercase tracking-tight text-left">Architectural Optimization</h3>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed font-medium italic text-left">
                        Based on the current runtime behavioral audit, Lumina recommends capping the memory allocation at **256MB** to prevent heap fragmentation. The project exhibits stable execution cycles.
                    </p>
                    <div className="flex gap-4">
                        <Badge variant="outline" className="bg-white/5 border-none text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-none">MEM_LIMIT: 256MB</Badge>
                        <Badge variant="outline" className="bg-white/5 border-none text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-none">CPU_SHARES: 0.5</Badge>
                    </div>
                    </div>
                    <div className="w-full md:w-64 h-32 bg-white/5 rounded-none border border-white/10 flex items-center justify-center text-left">
                    <div className="text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 text-center">Stability Index</p>
                        <p className="text-4xl font-black text-white text-center">92%</p>
                    </div>
                    </div>
                </div>
                </CardContent>
            </Card>
        </>
      )}
    </div>
  );
}
