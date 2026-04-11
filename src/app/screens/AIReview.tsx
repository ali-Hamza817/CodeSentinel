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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useProjectStore } from "../store/projectStore";
import { Progress } from "../components/ui/progress";

const mockFiles = [
  { name: "src/auth/login.ts", reviewed: true, issues: 3 },
  { name: "src/auth/middleware.ts", reviewed: true, issues: 5 },
  { name: "src/api/users.ts", reviewed: false, issues: 0 },
  { name: "src/api/products.ts", reviewed: false, issues: 0 },
  { name: "src/utils/crypto.ts", reviewed: true, issues: 2 },
];

export function AIReview() {
  const { getActiveProject } = useProjectStore();
  const activeProject = getActiveProject();
  const [selectedFile, setSelectedFile] = useState(mockFiles[1]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [aiResponse, setAiResponse] = useState("");
  const [showResults, setShowResults] = useState(false);

  const fullAnalysis = "The local Llama3 analysis of src/auth/middleware.ts identifies a significant security anti-pattern in how the authentication headers are parsed. Specifically, the implementation lacks boundary checks for JWT payloads, which could lead to buffer overruns in specific containerized environments. Additionally, the cross-reference with static findings confirms a High-Severity SQL injection risk linked to un-sanitized input in the session validator.";

  const handleGenerate = () => {
    setIsGenerating(true);
    setProgress(0);
    setShowResults(false);
    setAiResponse("");
    
    // Simulate Ollama analysis steps
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setShowResults(true);
          typeResponse();
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const typeResponse = () => {
    let i = 0;
    const typingInterval = setInterval(() => {
      setAiResponse(fullAnalysis.substring(0, i));
      i++;
      if (i > fullAnalysis.length) {
        clearInterval(typingInterval);
      }
    }, 20);
  };

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500">Please select a project to perform AI reviews.</p>
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
            <Button variant="outline" className="border-slate-200">
              Settings
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-100"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isGenerating ? "Analyzing..." : "Run Security Reasoning"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* File List */}
        <div className="w-80 border-r border-slate-200 bg-slate-50/30 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">
              Project Explorer
            </h3>
            <div className="space-y-1">
              {mockFiles.map((file, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedFile(file)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    selectedFile.name === file.name
                      ? "bg-white border border-slate-200 shadow-sm"
                      : "hover:bg-white/50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileCode className={`w-4 h-4 ${selectedFile.name === file.name ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className={`text-sm truncate ${selectedFile.name === file.name ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                      {file.name}
                    </span>
                  </div>
                  {file.reviewed && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Review Content */}
        <div className="flex-1 overflow-y-auto bg-white">
          {isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center p-12 space-y-6 max-w-2xl mx-auto text-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
                <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-purple-600 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Ollama is reasoning...</h3>
                <p className="text-sm text-slate-500">Cross-referencing AST findings with container runtime behavior</p>
              </div>
              <Progress value={progress} className="w-full h-2 bg-slate-100" />
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 px-3">Tokenizing</Badge>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 px-3">Analyzing Control Flow</Badge>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 px-3">Simulating Sandbox</Badge>
              </div>
            </div>
          ) : showResults ? (
            <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
               {/* Summary Card */}
               <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-white shadow-sm">
                <CardContent className="p-8">
                  <div className="flex gap-4">
                    <div className="p-3 bg-purple-600 rounded-xl h-fit">
                      <Terminal className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">Local Reasoning Results</h3>
                        <Badge className="bg-green-600/10 text-green-700 border-none">Verified</Badge>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-mono text-sm">
                        {aiResponse}
                        <span className="w-2 h-4 bg-purple-600 inline-block ml-1 animate-pulse" />
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actionable Findings */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-2 px-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-900">Mitigation Roadmap</h3>
                </div>
                
                {[
                  { title: "JWT Payload Boundary Check", type: "Security", desc: "Add size validation for the incoming JWT token to prevent potential overflow attacks in Node containers.", severity: "High" },
                  { title: "Parametric Query migration", type: "Logic", desc: "The session validator uses raw interpolation. Switch to 'sql-template-strings' for built-in security.", severity: "High" }
                ].map((item, idx) => (
                  <Card key={idx} className="border-slate-200 hover:border-purple-300 transition-colors bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="p-2 bg-slate-50 rounded-lg h-fit">
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-900">{item.title}</h4>
                            <p className="text-sm text-slate-500">{item.desc}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-slate-200 text-slate-500">{item.severity}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

               <Card className="border-amber-200 bg-amber-50/50">
                <CardContent className="p-5 flex items-center gap-4">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-sm text-amber-800">
                    <strong>Critical Insight:</strong> AI detected a correlation between High Cyclomatic Complexity in this file and a potential Authentication Bypass route. Check the integration test suite.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <Sparkles className="w-16 h-16 mb-4 opacity-20" />
              <h3 className="text-lg font-medium">Select a file and run reasoning</h3>
              <p className="text-sm max-w-xs mx-auto mt-1">Lumina AI will perform a deep semantic audit using your local hardware.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
