import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  FileCode,
  Lightbulb,
  ShieldCheck,
  BrainCircuit,
  Terminal,
  ChevronRight,
  ShieldAlert,
  Zap,
  CheckCircle,
  Send,
  User,
  Bot,
  Loader2,
  AlertCircle,
  Info
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useProjectStore, ScanFinding } from "../store/projectStore";
import { Progress } from "../components/ui/progress";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  findings?: ScanFinding[];
  measures?: string[];
  isContext?: boolean; // Hidden flag for context-injection messages
}

export function AIReview() {
  const { getActiveProject, saveAIReview } = useProjectStore();
  const activeProject = getActiveProject();
  
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Record<string, Message[]>>({});
  const [isContextSynced, setIsContextSynced] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeProject?.path) {
      loadProjectFiles();
    }
  }, [activeProject?.id]);

  useEffect(() => {
    if (activeProject?.aiReviews) {
      const history: Record<string, Message[]> = {};
      Object.entries(activeProject.aiReviews).forEach(([file, review]) => {
        if (review.messages) {
          history[file] = review.messages;
        } else if (review.reasoning || (review.findings && review.findings.length > 0)) {
          history[file] = [{
            role: 'assistant',
            content: review.reasoning || "Historical audit results are available for this file.",
            findings: review.findings,
            measures: review.measures
          }];
        }
      });
      setChatHistory(history);
      setIsContextSynced(true);
    }
  }, [activeProject?.aiReviews]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, selectedFile, isGenerating]);

  const loadProjectFiles = async () => {
    try {
      if (!activeProject?.path) return;
      const allFiles = await (window as any).api.getFiles(activeProject.path);
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

  const currentMessages = selectedFile ? (chatHistory[selectedFile] || []).filter(m => !m.isContext) : [];
  const fullHistory = selectedFile ? chatHistory[selectedFile] || [] : [];
  const currentFileName = selectedFile ? selectedFile.split(/[\\/]/).pop() : "";

  const handleAudit = async () => {
    if (!selectedFile || !activeProject || isGenerating) return;
    
    setIsGenerating(true);
    const newUserMsg: Message = { role: 'user', content: `Perform a deep architectural review of ${currentFileName}.` };
    
    setChatHistory(prev => ({
      ...prev,
      [selectedFile]: [...(prev[selectedFile] || []), newUserMsg]
    }));

    try {
      const patternFindings = await (window as any).api.scanFile(selectedFile);
      const content = await (window as any).api.readFile(selectedFile);
      
      const response = await (window as any).api.getAIReview(content, selectedFile);
      
      const aiFindings = (response.findings || []).map((f: any) => ({ ...f, type: 'AI: Security' }));
      const totalFindings = [...patternFindings, ...aiFindings];
      
      const newAiMsg: Message = { 
        role: 'assistant', 
        content: response.reasoning || `I have completed the semantic audit of ${currentFileName}. I found ${totalFindings.length} potential architectural concerns.`,
        findings: totalFindings,
        measures: response.measures
      };

      const updatedHistory = [...(chatHistory[selectedFile] || []), newUserMsg, newAiMsg];
      
      setChatHistory(prev => ({
        ...prev,
        [selectedFile]: updatedHistory
      }));

      await saveAIReview(activeProject.id, selectedFile, totalFindings, response.measures || [], newAiMsg.content, updatedHistory);
      setIsGenerating(false);
    } catch (err) {
      console.error("Audit failed:", err);
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || !selectedFile || !activeProject || isGenerating) return;

    const userText = inputMessage.trim();
    setInputMessage("");
    setIsGenerating(true);

    try {
      // 1. Fetch live file context
      const content = await (window as any).api.readFile(selectedFile);
      const existingReview = activeProject.aiReviews?.[selectedFile];
      
      // 2. Build context injection (System knowledge)
      const contextPrompt = `[CONTEXT INJECTION]
File Name: ${currentFileName}
Source Code:
\`\`\`
${content.slice(0, 5000)}
\`\`\`
Previous Audit Findings: ${JSON.stringify(existingReview?.findings || [])}
Previous Architectural Measures: ${JSON.stringify(existingReview?.measures || [])}

User is asking a question about this file. Use the code and findings above to provide an expert answer. If asking for a fix, provide the specific lines.`;

      const contextMsg: Message = { role: 'user', content: contextPrompt, isContext: true };
      const userMsg: Message = { role: 'user', content: userText };
      
      const historyBefore = chatHistory[selectedFile] || [];
      const updatedHistory = [...historyBefore, contextMsg, userMsg];

      setChatHistory(prev => ({
        ...prev,
        [selectedFile]: updatedHistory
      }));

      // 3. Chat with LLM
      const ollamaMessages = updatedHistory.map(m => ({ 
        role: m.role as 'user' | 'assistant' | 'system', 
        content: m.content 
      }));
      
      const responseText = await (window as any).api.chatWithArchitect(ollamaMessages);
      
      const newAiMsg: Message = { role: 'assistant', content: responseText };
      const finalHistory = [...updatedHistory, newAiMsg];

      setChatHistory(prev => ({
        ...prev,
        [selectedFile]: finalHistory
      }));

      // 4. Persist
      await saveAIReview(
        activeProject.id, 
        selectedFile, 
        existingReview?.findings || [], 
        existingReview?.measures || [], 
        existingReview?.reasoning || "", 
        finalHistory
      );
      
      setIsGenerating(false);
      setIsContextSynced(true);
    } catch (err) {
      console.error("Chat failed:", err);
      setIsGenerating(false);
    }
  };

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="p-4 bg-slate-50 rounded-full border border-slate-200">
          <BrainCircuit className="w-12 h-12 text-slate-300" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No AI Context</h2>
        <p className="text-slate-500 max-w-xs text-center font-medium">Select a repository to begin the Lumina-White reasoning sequence.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <BrainCircuit className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">AI Architect Review</h1>
            <div className="flex items-center gap-3 mt-1">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                 Llama 3.2 Expert Mode
               </p>
               {isContextSynced && (
                 <Badge variant="outline" className="text-[9px] height-4 px-2 bg-blue-50 text-blue-600 border-blue-100 font-black uppercase tracking-tighter">
                   Context Synchronized
                 </Badge>
               )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleAudit}
            disabled={isGenerating || !selectedFile}
            className="border-purple-200 text-purple-700 hover:bg-purple-50 font-bold h-9 px-4 gap-2 text-xs transition-all active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            DEEP ARCHITECT AUDIT
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Source Files */}
        <div className="w-72 border-r border-slate-100 bg-slate-50/30 overflow-y-auto flex flex-col">
          <div className="p-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
              Project Context
            </h3>
            <div className="space-y-1">
              {files.map((file, index) => {
                const fileName = file.split(/[\\/]/).pop();
                const isSelected = selectedFile === file;
                const hasReview = activeProject.aiReviews?.[file];
                
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedFile(file);
                      setIsContextSynced(!!hasReview);
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left group ${
                      isSelected 
                        ? "bg-white border border-slate-200 shadow-sm shadow-purple-500/5" 
                        : "hover:bg-slate-100/50 border border-transparent text-slate-500"
                    }`}
                  >
                    <FileCode className={`w-4 h-4 ${isSelected ? "text-purple-600" : "text-slate-400 opacity-60 group-hover:opacity-100"}`} />
                    <span className={`text-[13px] truncate flex-1 ${isSelected ? "font-bold text-slate-900" : "font-medium"}`}>
                      {fileName}
                    </span>
                    {hasReview && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50/20 relative">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar"
          >
            {currentMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-1000">
                 <div className="w-24 h-24 bg-white rounded-[2rem] border border-slate-100 flex items-center justify-center shadow-md shadow-purple-500/5">
                    <Bot className="w-12 h-12 text-purple-600" />
                 </div>
                 <div className="space-y-2">
                   <h3 className="text-xl font-bold text-slate-900 tracking-tight">Consult the Architect</h3>
                   <p className="text-sm text-slate-500 max-w-[320px] font-medium leading-relaxed">
                     Lumina-White is ready. Type a question about <span className="text-purple-600 font-bold">{currentFileName}</span> or initiate a deep audit to find vulnerabilities.
                   </p>
                 </div>
                 <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-white text-slate-500 border border-slate-200 px-3 py-1 cursor-pointer hover:bg-slate-50 transition-colors">"Explain this file"</Badge>
                    <Badge variant="secondary" className="bg-white text-slate-500 border border-slate-200 px-3 py-1 cursor-pointer hover:bg-slate-50 transition-colors">"Look for API flaws"</Badge>
                 </div>
              </div>
            ) : (
              currentMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-500`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
                    msg.role === 'user' 
                      ? 'bg-white border-slate-200 text-slate-600' 
                      : 'bg-gradient-to-br from-purple-600 to-indigo-600 border-transparent text-white'
                  }`}>
                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>

                  <div className={`flex flex-col gap-4 max-w-[85%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                    <div className={`p-5 rounded-2xl shadow-sm border ${
                      msg.role === 'user' 
                        ? 'bg-white text-slate-700 border-slate-100 rounded-tr-none' 
                        : 'bg-white text-slate-800 border-slate-100 rounded-tl-none line-height-relaxed'
                    }`}>
                      <p className="text-[14.5px] font-medium leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>

                    {msg.findings && msg.findings.length > 0 && (
                      <div className="grid grid-cols-1 gap-3 w-full animate-in fade-in zoom-in duration-700 delay-300">
                        <div className="flex items-center gap-2 mb-1">
                           <ShieldAlert className="w-4 h-4 text-slate-400" />
                           <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Actionable Findings</span>
                        </div>
                        {msg.findings.map((finding, fIdx) => (
                          <div key={fIdx} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-purple-200 transition-all group relative overflow-hidden">
                             <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                               finding.severity === 'critical' ? 'bg-red-500' : 
                               finding.severity === 'high' ? 'bg-orange-500' : 'bg-slate-400'
                             }`} />
                             <div className="flex items-start gap-4">
                                <div className="flex-1 space-y-2">
                                   <div className="flex items-center justify-between">
                                      <h4 className="text-[14px] font-bold text-slate-900 pr-4">{finding.title}</h4>
                                      <Badge transition-all duration-300 className={`text-[9px] font-black uppercase px-2 py-0.5 border-none rounded-md ${
                                        finding.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                                      }`}>
                                        {finding.severity}
                                      </Badge>
                                   </div>
                                   <p className="text-xs text-slate-500 leading-relaxed font-medium">{finding.description}</p>
                                   {finding.suggestedFix && (
                                     <div className="flex items-center gap-2 pt-2 border-t border-slate-50 mt-1">
                                        <Lightbulb className="w-3 h-3 text-purple-600" />
                                        <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest leading-none">AI Insight: Fix Recommended</span>
                                     </div>
                                   )}
                                </div>
                             </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isGenerating && (
              <div className="flex gap-4 animate-in fade-in duration-300">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="p-5 rounded-2xl bg-white/50 border border-slate-100 rounded-tl-none border-dashed">
                  <div className="flex items-center gap-3 text-slate-400 italic text-sm">
                    <div className="flex gap-1">
                       <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                       <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-150" />
                       <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-300" />
                    </div>
                    Architect is reasoning...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-6 bg-white/50 backdrop-blur-sm border-t border-slate-100">
            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-4">
              <div className="flex-1 relative group">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={selectedFile ? `Explain ${currentFileName} or ask for specific fixes...` : "Select a file to begin"}
                  disabled={!selectedFile || isGenerating}
                  className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-purple-500/5 focus:border-purple-600 transition-all disabled:opacity-50 shadow-sm"
                />
                <BrainCircuit className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
              </div>
              <Button 
                type="submit"
                disabled={!inputMessage.trim() || isGenerating}
                className="bg-purple-600 hover:bg-purple-700 h-12 w-12 rounded-2xl p-0 shadow-xl shadow-purple-600/10 active:scale-95 transition-all"
              >
                <Send className="w-5 h-5 text-white" />
              </Button>
            </form>
            <p className="text-[9px] text-center text-slate-400 mt-4 font-black uppercase tracking-[0.25em]">
               Context-Aware Neural Engine &bull; Zero-Trust Data Sovereignty
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
