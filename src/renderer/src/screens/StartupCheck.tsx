import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Cpu, 
  Database, 
  Container, 
  BrainCircuit, 
  AlertCircle, 
  ChevronRight,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { useProjectStore } from "../store/projectStore";

export function StartupCheck({ onComplete }: { onComplete: () => void }) {
  const [steps, setSteps] = useState({
    hardware: { status: 'pending', label: 'Hardware Verification', detail: 'Checking RAM and Core Count' },
    docker: { status: 'pending', label: 'Docker Runtime', detail: 'Verifying Docker Desktop status' },
    ollama: { status: 'pending', label: 'AI Container Pulse', detail: 'Provisioning Ollama Runtime' },
    model: { status: 'pending', label: 'Llama 3.2 Intelligence', detail: 'Pulling Model into Sandbox' }
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runChecks();
  }, []);

  const runChecks = async () => {
    try {
      // 1. Hardware Check
      setSteps(s => ({ ...s, hardware: { ...s.hardware, status: 'loading' } }));
      const health = await (window as any).api.getSystemHealth();
      if (health.ram.status === 'fail') {
        throw new Error(`Insufficient RAM (${health.ram.value}GB). 8GB recommended for CodeSentinel.`);
      }
      setSteps(s => ({ ...s, hardware: { ...s.hardware, status: 'success' } }));

      // 2. Docker Check
      setSteps(s => ({ ...s, docker: { ...s.docker, status: 'loading' } }));
      const dockerStatus = await (window as any).api.checkDocker();
      if (dockerStatus !== 'running') {
        throw new Error("Docker Desktop is not running. CodeSentinel requires Docker for secure sandboxing.");
      }
      setSteps(s => ({ ...s, docker: { ...s.docker, status: 'success' } }));

      // 3. Ollama & Model Pull
      setSteps(s => ({ ...s, ollama: { ...s.ollama, status: 'loading' } }));
      const aiDockerStatus = await (window as any).api.ensureAIDocker();
      if (aiDockerStatus === 'error') {
        throw new Error("Failed to start AI Container. Is Docker Desktop running?");
      }
      setSteps(s => ({ ...s, ollama: { ...s.ollama, status: 'success' } }));

      setSteps(s => ({ ...s, model: { ...s.model, status: 'loading' } }));
      const pullResult = await (window as any).api.pullModel();
      if (pullResult === 'error') {
        throw new Error("Failed to pull Llama 3.2 into the container sandbox.");
      }
      setSteps(s => ({ ...s, model: { ...s.model, status: 'success' } }));

      // 4. Hydrate Store
      await useProjectStore.getState().loadProjects();

      // Final Transition
      setTimeout(onComplete, 1000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-100 animate-in zoom-in duration-700">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">CodeSentinel</h1>
            <p className="text-sm font-bold text-blue-600 tracking-widest uppercase">Initializing Core Suite</p>
          </div>
        </div>

        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-xl overflow-hidden rounded-3xl">
          <CardContent className="p-8 space-y-6">
            {error ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-red-900">Environmental Error</p>
                    <p className="text-xs text-red-700 mt-1">{error}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <Button 
                        variant="outline"
                        onClick={() => window.open('https://www.docker.com/products/docker-desktop/', '_blank')}
                        className="text-[10px] font-black uppercase tracking-widest border-slate-200"
                    >
                        GET DOCKER
                    </Button>
                    <Button 
                        variant="outline"
                        onClick={() => window.open('https://ollama.com/', '_blank')}
                        className="text-[10px] font-black uppercase tracking-widest border-slate-200"
                    >
                        GET OLLAMA
                    </Button>
                </div>

                <Button 
                  onClick={() => { setError(null); runChecks(); }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 font-bold"
                >
                  Retry Initialization
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(steps).map(([key, step]) => (
                  <div key={key} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 bg-slate-50/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${
                        step.status === 'success' ? 'bg-green-100 text-green-600' : 
                        step.status === 'loading' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {key === 'hardware' && <Cpu className="w-5 h-5" />}
                        {key === 'docker' && <Container className="w-5 h-5" />}
                        {key === 'ollama' && <BrainCircuit className="w-5 h-5" />}
                        {key === 'model' && <Database className="w-5 h-5" />}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-slate-900">{step.label}</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{step.detail}</p>
                      </div>
                    </div>
                    {step.status === 'loading' && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
                    {step.status === 'success' && <CheckCircle2 className="w-5 h-5 text-green-600 animate-in zoom-in" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
          CodeSentinel Engine v1.0.0-Stable
        </p>
      </div>
    </div>
  );
}
