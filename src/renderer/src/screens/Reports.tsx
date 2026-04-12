import {  FileText, Shield, BarChart3, Clock, CheckCircle, Download, FileJson, ShieldOff, BrainCircuit, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useProjectStore } from "../store/projectStore";

export function Reports() {
  const { getActiveProject } = useProjectStore();
  const activeProject = getActiveProject();

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 animate-in fade-in duration-700">
        <div className="p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-left">
          <ShieldOff className="w-16 h-16 text-slate-300 mx-auto" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight text-center">No Active Workspace</h2>
          <p className="text-sm text-slate-500 font-medium italic text-center">Please select a repository to generate architectural reports.</p>
        </div>
      </div>
    );
  }

  const findings = activeProject.findings || [];
  const metrics = activeProject.metrics;
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const aiCount = findings.filter(f => f.type?.startsWith('AI:')).length;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-start justify-between">
        <div className="text-left">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 text-left">Audit Records</h2>
          <p className="text-sm font-medium text-slate-500 mt-1 text-left">
            Exportable analysis results for <span className="text-blue-600 font-bold">{activeProject.name}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-xs font-bold border-slate-200">
            Export PDF
          </Button>
          <Button className="bg-slate-900 hover:bg-black text-xs font-bold text-white px-6">
            Generate New Audit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-slate-200 shadow-sm overflow-hidden text-left text-left">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
             <div className="flex items-center gap-2 text-left">
                <Clock className="w-4 h-4 text-blue-600" />
                <CardTitle className="text-sm font-bold text-slate-700 text-left">Summary Metrics</CardTitle>
             </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500 font-medium text-left">Total Architectural Volume</span>
                <span className="text-sm font-bold text-slate-900 text-left">{metrics.totalFiles} Files</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500 font-medium text-left">Vulnerability Density</span>
                <span className="text-sm font-bold text-slate-900 text-left">{findings.length} findings</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500 font-medium text-left">AI Logic Insights</span>
                <span className="text-sm font-bold text-purple-600 text-left">{aiCount} reasoning hits</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-500 font-medium text-left">Last Audit Timestamp</span>
                <span className="text-sm font-bold text-slate-400 text-left">{activeProject.lastScanned}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-lg overflow-hidden bg-white text-left text-left">
           <CardHeader className="bg-slate-50/50 border-b border-slate-100">
             <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-600" />
                <CardTitle className="text-sm font-bold text-slate-700 text-left">Strategic Risk Overview</CardTitle>
             </div>
          </CardHeader>
          <CardContent className="p-8 text-center text-left">
             <div className="inline-flex items-center justify-center p-4 bg-purple-50 rounded-2xl mb-4">
                 <Shield className="w-10 h-10 text-purple-600" />
             </div>
             <div className="space-y-2 text-left">
                <h3 className="text-lg font-bold text-slate-900 text-center">Architecture Verified</h3>
                <p className="text-sm text-slate-500 font-medium text-center">
                    The Llama3 reasoning engine has verified <span className="text-purple-600 font-bold">{aiCount} logic vectors</span>. 
                    {criticalCount > 0 ? ` Immediate attention is required for the ${criticalCount} critical findings.` : ' No high-severity vulnerabilities were identified during the deep Reasoning pass.'}
                </p>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left">Detailed Audit Record</h3>
        <Card className="border-slate-200 shadow-sm text-left">
          <CardContent className="p-0 text-left">
            <div className="divide-y divide-slate-100">
              {findings.map((f, i) => (
                <div key={i} className="p-6 flex items-start gap-4 hover:bg-slate-50 transition-colors text-left text-left">
                  <div className={`p-2 rounded-lg h-fit ${
                        f.severity === 'critical' ? 'bg-red-50 text-red-600' :
                        f.severity === 'high' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-1 text-left">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 text-left">{f.title || f.message}</p>
                        <Badge variant="outline" className="text-[10px] font-bold text-slate-400 uppercase border-slate-100">
                            {f.severity}
                        </Badge>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-normsl text-left">
                      {f.description.slice(0, 160)}...
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1 text-left">Origin: {f.file}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
