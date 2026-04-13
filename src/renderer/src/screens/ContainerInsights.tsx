import { useState, useEffect } from "react";
import {
  Activity,
  ShieldAlert,
  ShieldOff,
  Zap,
  Terminal,
  Network,
  History,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileCode,
  Bug,
  Play,
  Square
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { useProjectStore } from "../store/projectStore";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";

export function ContainerInsights() {
  const { getActiveProject, startDynamicRun, updateProject } = useProjectStore();
  const activeProject = getActiveProject();
  const [liveMetrics, setLiveMetrics] = useState<{ time: string; cpu: number; memory: number }[]>([]);
  const [events, setEvents] = useState<{ id: string; type: string; msg: string; timestamp: string; severity: 'info' | 'warn' | 'crit' }[]>([]);
  const [isLaunching, setIsLaunching] = useState(false);

  const isRunning = activeProject?.sandboxStatus === 'running';
  const isBuilding = activeProject?.sandboxStatus === 'building';

  // Simulate Behavioral Events during dynamic analysis
  useEffect(() => {
    if (!isRunning) { setEvents([]); return; }
    const eventPool = [
      { type: 'FS_READ',    msg: 'System call: fs.readFile("/app/config.json")',           sev: 'info' as const },
      { type: 'NET_SOCKET', msg: 'Outbound TCP: 127.0.0.1:5001 → 127.0.0.1:49312',        sev: 'info' as const },
      { type: 'LOGIC_PASS', msg: 'Branch OK: handleRequest() — all paths reachable',        sev: 'info' as const },
      { type: 'PROC_FORK',  msg: 'Child process spawned: PID 1842 (worker thread)',         sev: 'info' as const },
      { type: 'FS_WRITE',   msg: 'Unexpected write to /tmp/cache — monitor for injection',  sev: 'warn' as const },
      { type: 'HEAP_ALERT', msg: 'Heap growth +12MB detected inside loop — possible leak',  sev: 'crit' as const },
      { type: 'NET_LISTEN', msg: 'Server bound to 0.0.0.0:5001 — accepting connections',    sev: 'info' as const },
      { type: 'AUTH_CHECK', msg: 'Authorization header validated on /api/orders',            sev: 'info' as const },
    ];
    const interval = setInterval(() => {
      const ev = eventPool[Math.floor(Math.random() * eventPool.length)];
      setEvents(prev => [{
        id: Math.random().toString(36).substring(7),
        type: ev.type, msg: ev.msg,
        timestamp: new Date().toLocaleTimeString([], { hour12: false }),
        severity: ev.sev
      }, ...prev].slice(0, 12));
    }, 3000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Poll docker stats when running
  useEffect(() => {
    if (!isRunning || !activeProject) { setLiveMetrics([]); return; }
    const interval = setInterval(async () => {
      try {
        const stats = await (window as any).api.dockerStats(activeProject.id);
        const cpuVal = parseFloat(stats.cpu?.replace('%', '') || '0');
        const memVal = parseFloat(stats.memUsage?.split(' / ')[0]?.replace(/[A-Za-z]/g, '') || '0');
        setLiveMetrics(prev => [...prev, {
          time: new Date().toLocaleTimeString([], { hour12: false }),
          cpu: isNaN(cpuVal) ? 0 : cpuVal,
          memory: isNaN(memVal) ? 0 : memVal
        }].slice(-20));
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, [isRunning, activeProject?.id]);

  const handleStop = async () => {
    if (!activeProject) return;
    await (window as any).api.dockerStop(activeProject.id);
    await updateProject(activeProject.id, { sandboxStatus: 'stopped' });
    setLiveMetrics([]);
  };

  const handleStart = async () => {
    if (!activeProject) return;
    setIsLaunching(true);
    try {
      await startDynamicRun(activeProject.id);
    } finally {
      setIsLaunching(false);
    }
  };

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 font-sans">
        <div className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
          <ShieldOff className="w-16 h-16 text-slate-200 mx-auto" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Project Selected</h2>
        <p className="text-sm text-slate-500 italic">Select a repository from the sidebar to begin.</p>
      </div>
    );
  }

  const findings = activeProject.findings || [];
  const metrics = activeProject.metrics;
  const critical = findings.filter(f => f.severity === 'critical').length;
  const high = findings.filter(f => f.severity === 'high').length;
  const medium = findings.filter(f => f.severity === 'medium').length;
  const low = findings.filter(f => f.severity === 'low').length;

  // Severity distribution for bar chart
  const severityData = [
    { label: 'Critical', count: critical, color: '#ef4444' },
    { label: 'High',     count: high,     color: '#f97316' },
    { label: 'Medium',   count: medium,   color: '#eab308' },
    { label: 'Low',      count: low,      color: '#3b82f6' },
  ];

  // File-level hotspot — top 5 files by finding count
  const fileMap: Record<string, number> = {};
  findings.forEach(f => { if (f.file) fileMap[f.file] = (fileMap[f.file] || 0) + 1; });
  const topFiles = Object.entries(fileMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([file, count]) => ({ file: file.split('/').pop() || file, count }));

  const dockerStats = metrics?.dockerStats || { cpu: '0%', mem: '0%', memUsage: '0B / 0B' };
  const cpuPercent = parseFloat(dockerStats.cpu?.replace('%', '') || '0');

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-700 bg-[#FAFAFB] min-h-full font-sans">

      {/* Header with sandbox controls */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-bold text-[10px] px-3 py-1 uppercase tracking-wider">
              Dynamic & Static Audit
            </Badge>
            {isRunning && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 rounded-full border border-green-100">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-green-700 uppercase">Sandbox Live</span>
              </div>
            )}
            {isBuilding && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-50 rounded-full border border-yellow-100">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-yellow-700 uppercase">Building Image...</span>
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 text-left">
            Behavioral Audit — <span className="text-blue-600">{activeProject.name}</span>
          </h2>
          <p className="text-sm font-medium text-slate-400 text-left">
            Static findings from last scan + live container telemetry when sandbox is active.
          </p>
        </div>

        {/* Sandbox Controls */}
        <div className="flex flex-col items-end gap-2">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              disabled={isLaunching || isBuilding}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 shadow-md shadow-indigo-100"
            >
              <Play className="w-3.5 h-3.5 mr-2" />
              {isLaunching || isBuilding ? 'Launching...' : 'Start Dynamic Run'}
            </Button>
          ) : (
            <Button
              onClick={handleStop}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold px-5"
            >
              <Square className="w-3.5 h-3.5 mr-2" />
              Stop Sandbox
            </Button>
          )}
          <span className="text-[10px] font-medium text-slate-400">
            Last scan: {activeProject.lastScanned}
          </span>
        </div>
      </div>

      {/* ═══════════════════ ALWAYS-VISIBLE STATIC SUMMARY ═══════════════════ */}
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: 'Total Files', value: metrics.totalFiles, icon: FileCode, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Vulnerabilities', value: metrics.vulnerabilities, icon: Bug, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Avg Complexity', value: metrics.avgComplexity?.toFixed(1) ?? '0.0', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Build Status', value: metrics.buildStatus, icon: metrics.buildStatus === 'Passed' ? CheckCircle : XCircle, color: metrics.buildStatus === 'Passed' ? 'text-green-600' : 'text-red-600', bg: metrics.buildStatus === 'Passed' ? 'bg-green-50' : 'bg-red-50' },
        ].map((kpi, i) => (
          <Card key={i} className="border-none shadow-[0_4px_12px_rgba(0,0,0,0.04)] bg-white overflow-hidden hover:-translate-y-0.5 transition-transform">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 ${kpi.bg} rounded-lg`}>
                  <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</span>
              </div>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row — severity distribution + file hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Severity Breakdown */}
        <Card className="border-none shadow-[0_4px_12px_rgba(0,0,0,0.04)] bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-50 py-5 px-7">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Severity Distribution</CardTitle>
              <Badge variant="outline" className="text-[9px] font-bold text-slate-400 border-slate-200">{findings.length} TOTAL FINDINGS</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-7">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={severityData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ border: 'none', borderRadius: '10px', fontSize: '11px', fontWeight: '700' }}
                  cursor={{ fill: '#F8FAFF' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-4 gap-2 mt-4">
              {severityData.map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-lg font-bold" style={{ color: s.color }}>{s.count}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Vulnerable Files */}
        <Card className="border-none shadow-[0_4px_12px_rgba(0,0,0,0.04)] bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-50 py-5 px-7">
            <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top Vulnerable Files</CardTitle>
          </CardHeader>
          <CardContent className="p-7">
            {topFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-400 mb-2" />
                <p className="text-xs font-bold text-slate-400">No vulnerabilities detected</p>
              </div>
            ) : topFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
                <span className="text-[10px] font-black text-slate-300 w-4">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">{f.file}</p>
                  <div className="mt-1">
                    <Progress value={(f.count / (topFiles[0]?.count || 1)) * 100} className="h-1 bg-slate-100" />
                  </div>
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                  i === 0 ? 'bg-red-50 text-red-600' : i === 1 ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-500'
                }`}>{f.count} issues</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Findings List */}
      <Card className="border-none shadow-[0_4px_12px_rgba(0,0,0,0.04)] bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-50 py-5 px-7">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Findings</CardTitle>
            <Badge variant="outline" className="text-[9px] font-bold text-slate-400 border-slate-200">TOP 8</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-50">
            {findings.slice(0, 8).map((f, i) => (
              <div key={i} className="flex items-start gap-4 px-7 py-4 hover:bg-slate-50/70 transition-colors">
                <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                  f.severity === 'critical' ? 'bg-red-50 text-red-600' :
                  f.severity === 'high' ? 'bg-orange-50 text-orange-500' :
                  'bg-slate-100 text-slate-400'
                }`}>
                  <AlertTriangle className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-800 truncate">{f.title}</p>
                    <Badge className={`text-[8px] font-black uppercase shrink-0 ${
                      f.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      f.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>{f.severity}</Badge>
                  </div>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5 truncate">{f.file}</p>
                </div>
              </div>
            ))}
            {findings.length === 0 && (
              <div className="p-12 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400">No findings — run a scan first.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════════ LIVE TELEMETRY — only when sandbox running ═══════════════════ */}
      {isRunning && (
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Runtime Telemetry</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* CPU Live Chart */}
            <Card className="lg:col-span-8 border-none shadow-[0_4px_12px_rgba(0,0,0,0.04)] bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-50 py-5 px-7">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Architectural Pressure</CardTitle>
                    <p className="text-[10px] text-slate-400 mt-0.5">Container CPU & memory over time</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{dockerStats.cpu}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">CPU</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-600">{dockerStats.memUsage.split(' / ')[0]}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Memory</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-7">
                <Progress value={cpuPercent} className="h-1.5 bg-slate-100 mb-6" />
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={liveMetrics}>
                    <defs>
                      <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip contentStyle={{ border: 'none', borderRadius: '10px', fontSize: '10px' }} />
                    <Area type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2.5} fill="url(#cpuGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Behavioral Event Feed */}
            <Card className="lg:col-span-4 border-none shadow-[0_4px_12px_rgba(0,0,0,0.04)] bg-white overflow-hidden flex flex-col">
              <CardHeader className="border-b border-slate-50 py-5 px-7">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-slate-400" />
                  <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logic Event Feed</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-y-auto max-h-[320px]">
                {events.length === 0 ? (
                  <div className="p-10 text-center">
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Waiting for events...</p>
                  </div>
                ) : events.map(ev => (
                  <div key={ev.id} className="px-5 py-3 flex items-start gap-3 border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                    <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                      ev.severity === 'info' ? 'bg-blue-400' :
                      ev.severity === 'warn' ? 'bg-orange-400' : 'bg-red-500 animate-pulse'
                    }`} />
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase">{ev.type}</span>
                        <span className="text-[8px] text-slate-300">{ev.timestamp}</span>
                      </div>
                      <p className="text-[10px] font-medium text-slate-600 leading-snug">{ev.msg}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Live App Preview */}
          <Card className="border-none shadow-[0_4px_12px_rgba(0,0,0,0.04)] bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-50 py-5 px-7">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Network className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Live Application Preview</CardTitle>
                    <p className="text-[10px] text-slate-400 font-medium italic mt-0.5">http://127.0.01:5001</p>
                  </div>
                </div>
                <Button
                  size="sm" variant="outline"
                  className="text-[10px] font-bold h-8 border-slate-200"
                  onClick={() => {
                    const iframe = document.getElementById('preview-frame') as HTMLIFrameElement;
                    if (iframe) { const src = iframe.src; iframe.src = ''; iframe.src = src; }
                  }}
                >
                  <History className="w-3.5 h-3.5 mr-1.5" />
                  Reload
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full min-h-[500px]">
                <iframe
                  id="preview-frame"
                  src="http://127.0.0.1:5001"
                  className="w-full h-[500px] border-none"
                  title="Live Application Preview"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
