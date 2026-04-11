import { useState, useEffect } from "react";
import {
  Sparkles,
  FileCode,
  ChevronRight,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  BrainCircuit,
  Terminal,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useProjectStore } from "../store/projectStore";
import { Progress } from "../components/ui/progress";

export function AIReview() {
  const { getActiveProject } = useProjectStore();
  const activeProject = getActiveProject();
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [findings, setFindings] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (activeProject?.path) {
      loadProjectFiles();
    }
  }, [activeProject?.id]);

  const loadProjectFiles = async () => {
    try {
      const allFiles = await (window as any).api.getFiles(activeProject?.path);
      setFiles(allFiles);
      if (allFiles.length > 0) setSelectedFile(allFiles[0]);
    } catch (err) {
      console.error("Failed to load files:", err);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;
    
    setIsGenerating(true);
    setProgress(0);
    setShowResults(false);
    setFindings([]);
    
    try {
      // Step 1: Read file content
      setProgress(20);
      const content = await (window as any).api.readFile(selectedFile);
      
      // Step 2: Call AI Review
      setProgress(50);
      const results = await (window as any).api.getAIReview(content, selectedFile);
      
      setFindings(results);
      setProgress(100);
      setTimeout(() => {
        setIsGenerating(false);
        setShowResults(true);
      }, 500);
    } catch (err) {
      console.error("AI Review failed:", err);
      setIsGenerating(false);
    }
  };

  const currentFileName = selectedFile ? selectedFile.split(/[\\/]/).pop() : "";

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 animate-in fade-in duration-500">
        <div className="p-4 bg-slate-100 rounded-full">
          <BrainCircuit className="w-12 h-12 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Active Project</h2>
        <p className="text-slate-500 max-w-xs text-center">Please select or add a project to start deep AI security reasoning.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-700">
      <div className="p-6 border-b border-slate-200 bg-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-slate-900">AI Architect Review</h2>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 ml-2">
                Ollama: Llama3 Local
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Deep semantic code auditing for {activeProject.name} using private local LLM
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedFile}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-100 min-w-[180px]"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isGenerating ? "Reasoning..." : "Run Security Reasoning"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* File List */}
        <div className="w-80 border-r border-slate-200 bg-slate-50/30 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">
              Source Files
            </h3>
            <div className="space-y-1">
              {files.map((file, index) => {
                const fileName = file.split(/[\\/]/).pop();
                return (
                  <div
                    key={index}
                    onClick={() => setSelectedFile(file)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                      selectedFile === file
                        ? "bg-white border border-slate-200 shadow-sm"
                        : "hover:bg-white/50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileCode className={`w-4 h-4 ${selectedFile === file ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className={`text-sm truncate ${selectedFile === file ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                        {fileName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Review Content */}
        <div className="flex-1 overflow-y-auto bg-white">
          {isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center p-12 space-y-6 max-w-2xl mx-auto text-center animate-in fade-in duration-500">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
                <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-purple-600 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Llama3 is reasoning...</h3>
                <p className="text-sm text-slate-500">Analyzing {currentFileName} for semantic vulnerabilities</p>
              </div>
              <Progress value={progress} className="w-full h-2 bg-slate-100" />
            </div>
          ) : showResults ? (
            <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
               {/* Summary Card */}
                <div className="flex items-center gap-3 mb-2">
                  <Terminal className="w-5 h-5 text-slate-900" />
                  <h3 className="text-lg font-bold text-slate-900">Findings for {currentFileName}</h3>
                  <Badge className="bg-green-600/10 text-green-700 border-none ml-auto">
                    {findings.length} Issues Detected
                  </Badge>
                </div>

              {/* Actionable Findings */}
              <div className="grid grid-cols-1 gap-4">
                {findings.length > 0 ? (
                  findings.map((item, idx) => (
                    <Card key={idx} className="border-slate-200 hover:border-purple-300 transition-all bg-white group shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg h-fit group-hover:bg-purple-600 group-hover:text-white transition-colors">
                              <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div className="space-y-2">
                              <div>
                                <h4 className="font-bold text-slate-900">{item.issue}</h4>
                                <p className="text-xs text-slate-400 font-mono mt-0.5">Line {item.line} in {currentFileName}</p>
                              </div>
                              <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto max-w-xl">
                                <code className="text-xs text-blue-300 font-mono whitespace-pre">{item.snippet}</code>
                              </div>
                              <div className="flex items-start gap-2 pt-2">
                                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-slate-600 italic">
                                  <strong>Fix:</strong> {item.recommendation}
                                </p>
                              </div>
                            </div>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={`
                              ${item.severity === 'Critical' ? 'bg-red-50 text-red-700 border-red-100' : 
                                item.severity === 'High' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                'bg-blue-50 text-blue-700 border-blue-100'}
                            `}
                          >
                            {item.severity}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="p-12 text-center bg-green-50/50 rounded-3xl border border-green-100">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-green-900">No Vulnerabilities Identified</h4>
                    <p className="text-sm text-green-700 mt-1">Llama3 architecture review passed for this file.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <Sparkles className="w-16 h-16 mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-slate-600">Deep Reasoning Engine Ready</h3>
              <p className="text-sm max-w-xs mx-auto mt-2 text-slate-400">
                Select a source file and initiate the Lumina-White reasoning sequence.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
