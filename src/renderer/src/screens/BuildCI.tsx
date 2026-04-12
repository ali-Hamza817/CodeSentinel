import { useState, useEffect, useRef } from "react";
import { Play, CheckCircle, XCircle, Clock, Package, ShieldOff, Terminal, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useProjectStore } from "../store/projectStore";

export function BuildCI() {
  const { getActiveProject, updateProject } = useProjectStore();
  const activeProject = getActiveProject();
  const [logs, setLogs] = useState<string[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeProject?.buildLogs) {
      setLogs(activeProject.buildLogs);
    }
  }, [activeProject?.id]);

  useEffect(() => {
    const removeListener = (window as any).api.onBuildLog((data: string) => {
      setLogs((prev) => [...prev, data]);
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });

    return () => {
        if (removeListener && typeof removeListener === 'function') removeListener();
    };
  }, []);

  useEffect(() => {
    let interval: any;
    if (isBuilding) {
      interval = setInterval(() => {
        setDuration(Math.floor((Date.now() - (startTime || Date.now())) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBuilding, startTime]);

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 animate-in fade-in duration-700">
        <div className="p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-left">
          <ShieldOff className="w-16 h-16 text-slate-300 mx-auto" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight text-center">No Active Workspace</h2>
          <p className="text-sm text-slate-500 font-medium italic text-center text-center">Please select or connect a repository to run pipelines.</p>
        </div>
      </div>
    );
  }

  const handleRunBuild = async () => {
    setIsBuilding(true);
    setLogs([]);
    setStartTime(Date.now());
    setDuration(0);

    try {
      const exitCode = await (window as any).api.runBuild(activeProject.path);
      const status = exitCode === 0 ? 'Passed' : 'Failed';
      
      await updateProject(activeProject.id, {
        metrics: { ...activeProject.metrics, buildStatus: status },
        buildLogs: logs
      });
    } catch (err) {
      console.error("Build execution error:", err);
    } finally {
      setIsBuilding(false);
    }
  };

  const buildStatus = activeProject.metrics.buildStatus;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-start justify-between">
        <div className="text-left">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 text-left text-left">Pipeline Orchestrator</h2>
          <p className="text-sm font-medium text-slate-500 mt-1 text-left text-left">
            Compiling isolated architecture for <span className="text-blue-600 font-bold">{activeProject.name}</span>
          </p>
        </div>

        <Button
          onClick={handleRunBuild}
          disabled={isBuilding}
          className={`${isBuilding ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 hover:bg-black shadow-lg shadow-slate-100'} text-xs font-bold h-10 px-6`}
        >
          {isBuilding ? (
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
               EXECUTING_CYCLE...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 fill-current" />
              INITIATE BUILD
            </div>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-sm overflow-hidden text-left text-left">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 text-left">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left text-left">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left">Build Tool</p>
                <p className="text-lg font-bold text-slate-900 text-left text-left">NPM / SHELL</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm overflow-hidden text-left text-left">
          <CardContent className="p-6 text-left">
            <div className="flex items-center gap-4 text-left">
              <div className="p-3 bg-slate-50 rounded-xl">
                <Clock className="w-5 h-5 text-slate-600" />
              </div>
              <div className="text-left text-left">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left">Cycle Duration</p>
                <p className="text-lg font-bold text-slate-900 text-left text-left">{duration}s <span className="text-xs font-semibold text-slate-400">Elapsed</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`shadow-sm overflow-hidden border-none text-left text-left ${
            buildStatus === 'Failed' ? "bg-red-500" : buildStatus === 'Passed' ? "bg-green-600" : "bg-slate-900"
          } text-white`}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4 text-left">
              <div className="p-3 bg-white/10 rounded-xl">
                {buildStatus === 'Failed' ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
              </div>
              <div className="text-left text-left text-left">
                <p className="text-xs font-bold text-white/60 uppercase tracking-wider text-left text-left">Current State</p>
                <p className="text-lg font-bold text-white text-left text-left">
                  {isBuilding ? "IN_PROGRESS" : buildStatus || "STANDBY"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-900 bg-slate-950 shadow-xl overflow-hidden text-left text-left">
        <CardHeader className="bg-slate-900/50 border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between text-left">
             <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 text-left text-left">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Live Binary Stream
             </CardTitle>
             <div className="flex gap-1.5 text-left text-left">
                <div className="w-2 h-2 rounded-full bg-red-500/20" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
                <div className="w-2 h-2 rounded-full bg-green-500/20" />
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 text-left">
          <div 
            ref={scrollRef}
            className="p-6 font-mono text-[11px] h-96 overflow-y-auto custom-scrollbar text-left text-left"
          >
            {logs.length === 0 && !isBuilding && (
              <div className="h-full flex flex-col items-center justify-center space-y-2 opacity-20 text-left text-left">
                 <Terminal className="w-8 h-8 text-white mx-auto" />
                 <p className="text-white font-bold uppercase tracking-widest text-center">Console stream in standby</p>
              </div>
            )}
            {logs.map((log, index) => (
              <div key={index} className="flex gap-4 group text-left text-left">
                <span className="text-slate-700 select-none w-8 text-right font-bold text-left">{index + 1}</span>
                <span className={`flex-1 whitespace-pre-wrap leading-relaxed text-left ${
                    log.includes("error") || log.includes("Error") ? "text-red-400 font-semibold" : 
                    log.includes("✓") || log.includes("success") ? "text-green-400" : "text-slate-300"
                }`}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
