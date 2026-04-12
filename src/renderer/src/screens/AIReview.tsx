import { useState, useEffect } from "react";
import {
  Sparkles,
  FileCode,
  Lightbulb,
  ShieldCheck,
  BrainCircuit,
  Terminal,
  Activity,
  Lock,
  ChevronRight,
  ShieldAlert,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useProjectStore } from "../store/projectStore";
import { Progress } from "../components/ui/progress";

export function AIReview() {
  const { getActiveProject, saveAIReview } = useProjectStore();
  const activeProject = getActiveProject();
  
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (activeProject?.path) {
      loadProjectFiles();
    }
  }, [activeProject?.id]);

  const loadProjectFiles = async () => {
    try {
      if (!activeProject?.path) return;
      const allFiles = await (window as any).api.getFiles(activeProject.path);
      // Filter for code files
      const codeFiles = allFiles.filter((f: string) => 
        ['.cs', '.ts', '.js', '.py', '.go', '.java', '.php', '.cpp', '.c'].some(ext => f.endsWith(ext))
      );
      setFiles(codeFiles);
      if (codeFiles.length > 0 && !selectedFile) {
        setSelectedFile(codeFiles[0]);
      }
    } catch (err) {
      console.error("Failed to load files:", err);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile || !activeProject) return;
    
    setIsGenerating(true);
    setProgress(10);
    
    try {
      // Step 1: Pattern-based fast scan
      setProgress(25);
      const patternFindings = await (window as any).api.scanFile(selectedFile);
      
      // Step 2: Read content for AI
      const content = await (window as any).api.readFile(selectedFile);
      setProgress(40);
      
      // Step 3: Deep AI Reasoning Pass
      const response = await (window as any).api.getAIReview(content, selectedFile);
      
      setProgress(90);
      
      // Merge: Add "AI:" prefix to AI findings to distinguish from pattern ones
      const aiFindings = (response.findings || []).map((f: any) => ({
        ...f,
        type: 'AI: Security'
      }));

      // Merge pattern results
      const totalFindings = [...patternFindings, ...aiFindings];
      
      // Persist to store (this handles the conversion to ScanFinding shape)
      await saveAIReview(activeProject.id, selectedFile, totalFindings, response.measures || []);
      
      setProgress(100);
      setTimeout(() => setIsGenerating(false), 500);
    } catch (err) {
      console.error("AI reasoning failed:", err);
      setIsGenerating(false);
    }
  };

  const currentFileName = selectedFile ? selectedFile.split(/[\\/]/).pop() : "";
  const currentReview = activeProject?.aiReviews?.[selectedFile || ""];

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 animate-in fade-in duration-500">
        <div className="p-4 bg-slate-50 rounded-full border border-slate-200">
          <BrainCircuit className="w-12 h-12 text-slate-300" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No AI Context</h2>
        <p className="text-slate-500 max-w-xs text-center font-medium">Select a repository to begin the Lumina-White reasoning sequence.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white animate-in fade-in duration-700">
      {/* Header */}
      <div className="p-8 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-1">
              <BrainCircuit className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">AI Architect Review</h1>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-bold px-2 py-0">
                Ollama: Llama3 Local
              </Badge>
            </div>
            <p className="text-sm font-medium text-slate-500">
              Deep semantic code auditing for {activeProject.name} using private local LLM
            </p>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedFile}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-xl shadow-purple-50 h-10 px-6 font-bold gap-2 transition-all active:scale-95"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                Reasoning...
              </div>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                Run Security Reasoning
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Source Files */}
        <div className="w-80 border-r border-slate-100 bg-slate-50/20 overflow-y-auto">
          <div className="p-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
              Source Files
            </h3>
            <div className="space-y-1">
              {files.map((file, index) => {
                const fileName = file.split(/[\\/]/).pop();
                const isSelected = selectedFile === file;
                const hasReview = activeProject.aiReviews?.[file];
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                      isSelected 
                        ? "bg-white border border-slate-200 shadow-sm" 
                        : "hover:bg-slate-100/50 border border-transparent"
                    }`}
                  >
                    <FileCode className={`w-4 h-4 ${isSelected ? "text-purple-600" : "text-slate-400"}`} />
                    <span className={`text-sm truncate flex-1 ${isSelected ? "font-bold text-slate-900" : "font-medium text-slate-500"}`}>
                      {fileName}
                    </span>
                    {hasReview && <CheckCircle className="w-3 h-3 text-green-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content: Review Results */}
        <div className="flex-1 overflow-y-auto">
          {isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center p-12 max-w-xl mx-auto text-center space-y-6 animate-in fade-in duration-1000">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-slate-100 border-t-purple-600 rounded-full animate-spin" />
                <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-purple-600 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Neural Synthesis Active</h3>
                <p className="text-sm text-slate-500 font-medium">
                  Llama 3.2 is auditing <span className="text-slate-900">{currentFileName}</span> for semantic flaws.
                </p>
              </div>
              <Progress value={progress} className="w-full h-1.5 bg-slate-100" />
            </div>
          ) : currentReview ? (
            <div className="p-10 max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* Measures Overview */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-slate-900">Security Measures Needed</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(currentReview.measures || []).map((measure, i) => (
                    <div key={i} className="flex gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-purple-200 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 text-[10px] font-black text-slate-400 group-hover:text-purple-600 group-hover:border-purple-200 transition-colors">
                        {i + 1}
                      </div>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed">
                        {measure}
                      </p>
                    </div>
                  ))}
                  {(!currentReview.measures || currentReview.measures.length === 0) && (
                    <p className="text-sm text-slate-400 font-medium col-span-2 italic">No architectural measures were designated for this file.</p>
                  )}
                </div>
              </div>

              {/* Specific Findings */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-slate-900" />
                    <h3 className="text-lg font-bold text-slate-900">Code Vulnerabilities</h3>
                  </div>
                  <Badge className="bg-slate-900 text-white rounded-lg border-none">
                    {currentReview.findings?.length || 0} Findings
                  </Badge>
                </div>

                <div className="space-y-4">
                  {(currentReview.findings || []).map((finding, idx) => (
                    <Card key={idx} className="border-slate-100 hover:border-purple-200 transition-all bg-white shadow-sm overflow-hidden group">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex gap-4">
                            <div className={`p-2 rounded-xl h-fit transition-colors ${
                              finding.severity === 'critical' ? 'bg-red-50 text-red-600' : 
                              finding.severity === 'high' ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-600'
                            }`}>
                              <ShieldAlert className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-bold text-slate-900 text-base">{finding.title}</h4>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Line {finding.line} &bull; {finding.file.split(/[\\/]/).pop()}
                              </p>
                            </div>
                          </div>
                          <Badge className={`px-3 py-1 rounded-lg border-none font-bold uppercase text-[10px] tracking-widest ${
                            finding.severity === 'critical' ? 'bg-red-100 text-red-700' : 
                            finding.severity === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {finding.severity}
                          </Badge>
                        </div>

                        {finding.affectedCode && (
                          <div className="bg-slate-950 rounded-2xl p-4 mb-4 overflow-x-auto">
                            <code className="text-[13px] text-blue-300 font-mono whitespace-pre opacity-90">
                              {finding.affectedCode}
                            </code>
                          </div>
                        )}

                        <div className="flex items-start gap-3 p-4 bg-purple-50/30 rounded-2xl border border-purple-50">
                          <Lightbulb className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span className="text-[11px] font-black text-purple-600 uppercase tracking-widest">Recommended Fix</span>
                            <p className="text-sm font-medium text-slate-700 leading-relaxed">
                              {finding.suggestedFix}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-1000">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Deep Reasoning Engine Ready</h3>
              <p className="text-sm max-w-sm mx-auto mt-2 text-slate-500 font-medium">
                Select a source file from the sidebar and initiate the Lumina-White reasoning sequence for deep architectural analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
