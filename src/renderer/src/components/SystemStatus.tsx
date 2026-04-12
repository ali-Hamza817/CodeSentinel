import { useState, useEffect } from "react";
import { Container, BrainCircuit, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Badge } from "./ui/badge";

export function SystemStatus() {
  const [dockerStatus, setDockerStatus] = useState<'running' | 'not_running' | 'loading'>('loading');
  const [ollamaStatus, setOllamaStatus] = useState<'running' | 'not_running' | 'loading'>('loading');
  const [ollamaChecked, setOllamaChecked] = useState(false);

  const checkHealth = async () => {
    // 1. Check Docker
    try {
      const docker = await (window as any).api.checkDocker();
      setDockerStatus(docker === 'running' ? 'running' : 'not_running');
    } catch {
      setDockerStatus('not_running');
    }

    // 2. Check Ollama — use ensureAIDocker (HEAD /) NOT pullModel — never call pull as a health check!
    if (!ollamaChecked) {
      try {
        const result = await (window as any).api.ensureAIDocker();
        setOllamaStatus(result === 'running' ? 'running' : 'not_running');
        if (result === 'running') setOllamaChecked(true); // stop re-checking once confirmed
      } catch {
        setOllamaStatus('not_running');
      }
    }
  };

  useEffect(() => {
    checkHealth();
    // Only poll Docker every 30s — Ollama status is cached once found
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [ollamaChecked]);

  const StatusDot = ({ status }: { status: 'running' | 'not_running' | 'loading' }) => {
    if (status === 'running') return <CheckCircle2 className="w-2.5 h-2.5" />;
    if (status === 'loading') return <Loader2 className="w-2.5 h-2.5 animate-spin" />;
    return <XCircle className="w-2.5 h-2.5" />;
  };

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className={`px-2 py-0.5 rounded-full border-none flex items-center gap-1.5 transition-colors ${
          dockerStatus === 'running' ? 'bg-green-50 text-green-700' :
          dockerStatus === 'loading' ? 'bg-slate-50 text-slate-400' : 'bg-red-50 text-red-700'
        }`}
      >
        <Container className="w-3 h-3" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Docker</span>
        <StatusDot status={dockerStatus} />
      </Badge>

      <Badge
        variant="outline"
        className={`px-2 py-0.5 rounded-full border-none flex items-center gap-1.5 transition-colors ${
          ollamaStatus === 'running' ? 'bg-purple-50 text-purple-700' :
          ollamaStatus === 'loading' ? 'bg-slate-50 text-slate-400' : 'bg-red-50 text-red-700'
        }`}
      >
        <BrainCircuit className="w-3 h-3" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Llama 3.2</span>
        <StatusDot status={ollamaStatus} />
      </Badge>
    </div>
  );
}
