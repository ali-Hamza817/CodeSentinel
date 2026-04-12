import { useState, useEffect, useRef } from "react";
import {
  Play,
  Square,
  Container,
  Activity,
  Cpu,
  HardDrive,
  ShieldCheck,
  Terminal,
  Clock,
  Timer,
  Layers,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { useProjectStore } from "../store/projectStore";

export function DynamicAnalysis() {
  const { getActiveProject, updateProject } = useProjectStore();
  const activeProject = getActiveProject();

  const [logs, setLogs] = useState<string[]>([]);
  const [phase, setPhase] = useState<'idle' | 'building' | 'running' | 'done'>('idle');
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildTime, setBuildTime] = useState<number | null>(null);
  const [startupTime, setStartupTime] = useState<number | null>(null);
  const [uptime, setUptime] = useState(0);
  const [stats, setStats] = useState({ cpu: '0%', mem: '0%', memUsage: '0B / 0B' });

  const scrollRef = useRef<HTMLDivElement>(null);
  const buildStartRef = useRef<number>(0);
  const runStartRef = useRef<number>(0);
  const uptimeRef = useRef<NodeJS.Timeout | null>(null);
  const statsRef = useRef<NodeJS.Timeout | null>(null);
  const buildProgRef = useRef<NodeJS.Timeout | null>(null);

  // Log listener
  useEffect(() => {
    const off = (window as any).api.onDockerLog((data: string) => {
      setLogs(prev => [...prev, data]);
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 50);
    });
    return () => { if (typeof off === 'function') off(); };
  }, []);

  // Start polling when running
  useEffect(() => {
    if (phase === 'running' && activeProject) {
      uptimeRef.current = setInterval(() => setUptime(u => u + 1), 1000);
      statsRef.current = setInterval(async () => {
        try {
          const s = await (window as any).api.dockerStats(activeProject.id);
          if (s) setStats(s);
        } catch {}
      }, 2000);
    } else {
      if (uptimeRef.current) clearInterval(uptimeRef.current);
      if (statsRef.current) clearInterval(statsRef.current);
      if (phase !== 'running') { setUptime(0); setStats({ cpu: '0%', mem: '0%', memUsage: '0B / 0B' }); }
    }
    return () => {
      if (uptimeRef.current) clearInterval(uptimeRef.current);
      if (statsRef.current) clearInterval(statsRef.current);
    };
  }, [phase, activeProject?.id]);

  const formatTime = (ms: number) => ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
  const formatUptime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const handleProvision = async () => {
    if (!activeProject?.path) {
      addLog('⚠ No repository path found. Please connect and clone a repository first.');
      return;
    }

    setLogs([]);
    setBuildProgress(0);
    setBuildTime(null);
    setStartupTime(null);
    setPhase('building');

    // Simulate smooth build progress
    buildProgRef.current = setInterval(() => {
      setBuildProgress(p => {
        if (p >= 90) { clearInterval(buildProgRef.current!); return 90; }
        return p + Math.random() * 3;
      });
    }, 800);

    addLog(`▶ Provisioning sandbox for: ${activeProject.name}`);
    addLog(`▶ Repo path: ${activeProject.path}`);
    addLog(`▶ Building Docker image from repo...`);

    buildStartRef.current = Date.now();

    try {
      // Build the REPOSITORY's docker image
      await (window as any).api.dockerBuild(activeProject.id, activeProject.path);
      const bt = Date.now() - buildStartRef.current;
      setBuildTime(bt);

      clearInterval(buildProgRef.current!);
      setBuildProgress(100);
      addLog(`✓ Image built in ${formatTime(bt)}`);
      addLog(`▶ Starting container...`);

      // Run the repo container
      runStartRef.current = Date.now();
      await (window as any).api.dockerRun(activeProject.id);
      const st = Date.now() - runStartRef.current;
      setStartupTime(st);

      addLog(`✓ Container started in ${formatTime(st)}`);
      addLog(`● Sandbox is live. Monitoring started.`);

      setPhase('running');
      updateProject(activeProject.id, {
        sandboxStatus: 'running',
        metrics: {
          ...activeProject.metrics,
          buildTimeMs: bt,
          startupTimeMs: st
        }
      });
    } catch (err: any) {
      clearInterval(buildProgRef.current!);
      addLog(`✗ Error: ${err?.message || 'Provision failed'}`);
      addLog(`ℹ Ensure the repository has a valid Dockerfile or one will be auto-generated.`);
      setPhase('idle');
    }
  };

  const handleStop = async () => {
    try {
      addLog('▶ Terminating sandbox...');
      await (window as any).api.dockerStop(activeProject!.id);
      updateProject(activeProject!.id, { sandboxStatus: 'stopped' });
      addLog('● Sandbox terminated.');
      setPhase('done');
    } catch (err: any) {
      addLog(`✗ Stop failed: ${err?.message}`);
    }
  };

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 animate-in fade-in duration-500">
        <div className="p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <Container className="w-12 h-12 text-slate-300 mx-auto" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 text-center">No Active Repository</h2>
        <p className="text-sm text-slate-500 text-center max-w-xs">Connect a repository to provision its Docker sandbox and measure runtime performance.</p>
      </div>
    );
  }

  const memPercent = parseFloat(stats.mem) || 0;

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dynamic Analysis</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Runtime sandbox for <span className="text-blue-600 font-bold">{activeProject.name}</span>
            <span className="text-slate-300 mx-2">·</span>
            <span className="text-[11px] font-mono text-slate-400">codesentinel-sandbox-{activeProject.id}</span>
          </p>
        </div>

        <div className="flex gap-2">
          {phase === 'running' ? (
            <Button onClick={handleStop} className="bg-red-600 hover:bg-red-700 text-xs font-bold h-10 px-5 gap-2">
              <Square className="w-4 h-4 fill-current" />
              TERMINATE
            </Button>
          ) : (
            <Button
              onClick={handleProvision}
              disabled={phase === 'building'}
              className={`${phase === 'building' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-black'} text-xs font-bold h-10 px-5 gap-2`}
            >
              {phase === 'building' ? (
                <><div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> BUILDING...</>
              ) : (
                <><Play className="w-4 h-4 fill-current" /> PROVISION SANDBOX</>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Build progress bar */}
      {phase === 'building' && (
        <Card className="border-blue-200 bg-blue-50/30 animate-in fade-in duration-300">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                <span className="font-bold text-slate-700 uppercase tracking-widest text-[10px]">Building Repository Image</span>
              </div>
              <span className="font-mono font-bold text-blue-600">{Math.round(buildProgress)}%</span>
            </div>
            <Progress value={buildProgress} className="h-1.5 bg-blue-100" indicatorClassName="bg-blue-600" />
          </CardContent>
        </Card>
      )}

      {/* Classic Benchmark Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-xl"><Timer className="w-4 h-4 text-blue-600" /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Build Time</p>
                <p className="text-lg font-bold text-slate-900 font-mono">
                  {buildTime ? formatTime(buildTime) : '--'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-50 rounded-xl"><Zap className="w-4 h-4 text-green-600" /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Startup Time</p>
                <p className="text-lg font-bold text-slate-900 font-mono">
                  {startupTime ? formatTime(startupTime) : '--'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-yellow-50 rounded-xl"><Cpu className="w-4 h-4 text-yellow-600" /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CPU</p>
                <p className="text-lg font-bold text-slate-900 font-mono">{stats.cpu}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`shadow-sm border-none ${phase === 'running' ? 'bg-blue-600' : 'bg-slate-900'} text-white`}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 rounded-xl">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Uptime</p>
                <p className="text-lg font-bold font-mono">{formatUptime(uptime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Docker Terminal */}
        <Card className="border-slate-900 bg-slate-950 shadow-xl">
          <CardHeader className="bg-slate-900 border-b border-white/5 py-3">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              Docker Engine Output
              {phase === 'running' && <span className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div ref={scrollRef} className="p-4 font-mono text-[10px] h-80 overflow-y-auto space-y-0.5">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-10">
                  <Container className="w-10 h-10 text-white mx-auto" />
                  <p className="text-white mt-3 font-bold uppercase tracking-widest text-[9px]">Awaiting sandbox provisioning</p>
                </div>
              ) : logs.map((log, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-slate-700 w-6 text-right shrink-0">{i + 1}</span>
                  <span className={`${
                    log.startsWith('✓') ? 'text-green-400' :
                    log.startsWith('✗') ? 'text-red-400' :
                    log.startsWith('●') ? 'text-blue-400' :
                    log.startsWith('⚠') ? 'text-yellow-400' :
                    'text-slate-300'
                  } leading-relaxed`}>{log}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Side: Memory + Summary */}
        <div className="space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-purple-600" />
                Memory Allocation
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-slate-900 font-mono">{stats.memUsage.split(' / ')[0] || '0B'}</p>
                <p className="text-xs text-slate-400">of {stats.memUsage.split(' / ')[1] || '—'}</p>
              </div>
              <Progress value={memPercent} className="h-2 bg-slate-100" indicatorClassName={memPercent > 80 ? 'bg-red-500' : 'bg-purple-600'} />
              <p className="text-[10px] text-slate-400">{stats.mem} utilization</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {[
                { label: 'Image Build Latency', value: buildTime ? formatTime(buildTime) : '--' },
                { label: 'Container Startup', value: startupTime ? formatTime(startupTime) : '--' },
                { label: 'Live CPU', value: stats.cpu },
                { label: 'Sandbox State', value: phase === 'running' ? 'ACTIVE' : phase === 'building' ? 'BUILDING' : 'OFFLINE' }
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{label}</span>
                  <span className={`font-mono font-bold ${value === 'ACTIVE' ? 'text-green-600' : value === 'BUILDING' ? 'text-blue-600' : 'text-slate-900'}`}>
                    {value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[10px] text-slate-400 leading-relaxed">
            <span className="font-bold text-slate-500">How it works:</span> CodeSentinel builds a Docker image directly from your repository's source code. If no Dockerfile exists, a generic one is auto-generated. Live CPU and memory stats are polled every 2 seconds from the running container.
          </div>
        </div>
      </div>
    </div>
  );
}
