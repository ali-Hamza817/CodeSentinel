import { useState } from "react";
import { Shield, AlertCircle, AlertTriangle, Info, ChevronDown, ChevronRight, Search, BrainCircuit, Sparkles, Terminal, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useProjectStore } from "../store/projectStore";

function VulnerabilityCard({ vulnerability }: { vulnerability: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isAI = vulnerability.type?.startsWith('AI:');

  const Icon =
    vulnerability.severity === "critical"
      ? AlertCircle
      : vulnerability.severity === "high"
      ? AlertTriangle
      : isAI ? BrainCircuit : Info;

  return (
    <Card className={`border-slate-200 hover:border-blue-200 transition-all shadow-sm ${isAI ? 'bg-gradient-to-r from-purple-50/20 to-white' : ''} text-left`}>
      <CardContent className="p-5">
        <div
          className="flex items-start gap-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              vulnerability.severity === "critical" ? "bg-red-50 text-red-600" : 
              vulnerability.severity === "high" ? "bg-orange-50 text-orange-600" :
              isAI ? "bg-purple-100 text-purple-600" : "bg-blue-50 text-blue-600"
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 text-left">
                  {vulnerability.title || vulnerability.message}
                </h3>
                <Badge
                  variant="outline"
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 border-none ${
                    vulnerability.severity === "critical"
                      ? "bg-red-600 text-white"
                      : vulnerability.severity === "high"
                      ? "bg-orange-600 text-white"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {vulnerability.severity}
                </Badge>
                {isAI && (
                    <Badge className="bg-purple-600 text-white border-none text-[10px] font-bold uppercase px-2 py-0.5 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        AI Verified
                    </Badge>
                )}
              </div>
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-slate-300 shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
              )}
            </div>

            <p className="text-sm text-slate-600 font-medium mb-3 leading-relaxed text-left">
              {vulnerability.description.replace('[DEEP REASONING] ', '')}
            </p>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 text-left">
              <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100 italic lowercase font-normal">{vulnerability.file || 'Global Context'}</span>
              {vulnerability.line > 0 && <span>Line {vulnerability.line}</span>}
              <span className="text-blue-500 uppercase tracking-wider text-[10px]">{vulnerability.type}</span>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300 space-y-6 text-left">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 text-left">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 text-left">
                    <Terminal className="w-4 h-4 text-blue-500" />
                    Code Context
                </h4>
                <div className="p-4 bg-slate-900 rounded-xl text-xs font-mono overflow-x-auto shadow-inner text-left">
                    <code className="text-blue-300">{vulnerability.snippet || '// No additional context available'}</code>
                </div>
                </div>

                <div className="space-y-2 text-left">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 text-left">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    Remediation Plan
                </h4>
                <div className={`p-4 rounded-xl text-sm font-medium leading-relaxed border text-left ${isAI ? 'bg-purple-50/50 border-purple-100 text-purple-900' : 'bg-slate-50 border-slate-100 text-slate-700'}`}>
                    {isAI ? (
                        <div className="space-y-2 text-left text-left">
                             <p className="font-bold uppercase tracking-wider text-[10px] opacity-40">Reasoning Result</p>
                             <p className="italic text-left">{vulnerability.description.split(']')[1] || vulnerability.description}</p>
                        </div>
                    ) : (
                        vulnerability.description
                    )}
                </div>
                </div>
             </div>

            <div className="flex gap-2 pt-2 text-left">
              <Button size="sm" variant="outline" className="text-xs font-bold h-9 px-4 border-slate-200">
                Silence Vector
              </Button>
              <Button size="sm" className="bg-slate-900 hover:bg-black text-xs font-bold h-9 px-4">
                Execute Fix
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function Vulnerabilities() {
  const { getActiveProject } = useProjectStore();
  const activeProject = getActiveProject();
  const [search, setSearch] = useState("");

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 animate-in fade-in duration-700">
        <div className="p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-left">
          <Shield className="w-16 h-16 text-slate-300 mx-auto" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight text-center">No Active Workspace</h2>
          <p className="text-sm text-slate-500 font-medium italic text-center text-center">Connect a repository to audit vulnerabilities.</p>
        </div>
      </div>
    );
  }

  const findings = (activeProject.findings || []).filter(f => 
    f.message?.toLowerCase().includes(search.toLowerCase()) || 
    f.type?.toLowerCase().includes(search.toLowerCase())
  );

  const criticalCount = findings.filter((v) => v.severity === "critical").length;
  const highCount = findings.filter((v) => v.severity === "high").length;
  const aiCount = findings.filter((v) => v.type?.startsWith('AI:')).length;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-start justify-between">
        <div className="text-left">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 text-left">Security Registry</h2>
          <p className="text-sm font-medium text-slate-500 mt-1 text-left">
            Detected architectural weaknesses in <span className="text-blue-600 font-bold">{activeProject.name}</span>
          </p>
        </div>
        <div className="relative text-left">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter findings..." 
            className="pl-10 pr-6 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-72"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none bg-red-600 shadow-xl shadow-red-50 text-left">
          <CardContent className="p-6 text-left">
            <div className="flex items-center justify-between text-left">
              <div className="text-left text-left">
                <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1 text-left">Critical Risks</p>
                <p className="text-4xl font-bold text-white text-left">
                  {criticalCount}
                </p>
              </div>
              <div className="p-4 bg-white/10 rounded-xl">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-slate-900 shadow-xl shadow-slate-100 text-left text-left">
          <CardContent className="p-6 text-left">
            <div className="flex items-center justify-between text-left">
              <div className="text-left text-left">
                <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-1 text-left">AI Reasoning</p>
                <p className="text-4xl font-bold text-white">
                  {aiCount}
                </p>
              </div>
              <div className="p-4 bg-white/10 rounded-xl">
                <BrainCircuit className="w-8 h-8 text-blue-400 animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm text-left">
          <CardContent className="p-6 text-left">
            <div className="flex items-center justify-between text-left">
              <div className="text-left text-left">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 text-left">Total Findings</p>
                <p className="text-4xl font-bold text-slate-900">
                  {findings.length}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <Shield className="w-8 h-8 text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 text-left text-left">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left">Active Audit Trail</h3>
          <div className="flex gap-4 text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Identified: {findings.length}</p>
            <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest text-left">Deep reasoning: {aiCount}</p>
          </div>
        </div>
        
        {findings.length === 0 ? (
          <div className="py-24 text-center space-y-4 bg-slate-50/50 rounded-3xl border border-slate-100">
             <div className="w-16 h-16 bg-white rounded-2xl shadow-sm mx-auto flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-green-500" />
             </div>
             <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 text-center">No vulnerabilities detected</p>
                <p className="text-xs font-medium text-slate-500 text-center uppercase tracking-widest">Heuristic pass is complete</p>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {findings.map((vulnerability, idx) => (
              <VulnerabilityCard key={idx} vulnerability={vulnerability} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
