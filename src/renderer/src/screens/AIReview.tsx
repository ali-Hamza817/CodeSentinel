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
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  findings?: ScanFinding[];
  measures?: string[];
  isContext?: boolean;
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

  // Handle Streaming Listeners
  useEffect(() => {
    const handleChatChunk = (chunk: string) => {
      setChatHistory(prev => {
        if (!selectedFile) return prev;
        const currentArr = prev[selectedFile] || [];
        const current = [...currentArr];
        const last = current[current.length - 1];
        if (last && last.role === 'assistant') {
          last.content += chunk;
          return { ...prev, [selectedFile]: current };
        }
        return prev;
      });
    };

    const handleReviewChunk = (chunk: string) => {
      setChatHistory(prev => {
        if (!selectedFile) return prev;
        const currentArr = prev[selectedFile] || [];
        const current = [...currentArr];
        const last = current[current.length - 1];
        if (last && last.role === 'assistant') {
          if (chunk.includes('[[JSON]]')) return prev; 
          last.content += chunk.replace('[[REASONING]]', '');
          return { ...prev, [selectedFile]: current };
        }
        return prev;
      });
    };

    (window as any).api.onAIChatChunk(handleChatChunk);
    (window as any).api.onAIReviewChunk(handleReviewChunk);

    return () => {
      // In a real Electron app we'd remove listeners, but here it's fine
    };
  }, [selectedFile]);

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
  const currentFileName = selectedFile ? selectedFile.split(/[\\/]/).pop() : "";

  const handleAudit = async () => {
    if (!selectedFile || !activeProject || isGenerating) return;
    
    setIsGenerating(true);
    const newUserMsg: Message = { role: 'user', content: `Perform a deep architectural review of ${currentFileName}.` };
    const placeholderMsg: Message = { role: 'assistant', content: "" }; 
    
    setChatHistory(prev => ({
      ...prev,
      [selectedFile]: [...(prev[selectedFile] || []), newUserMsg, placeholderMsg]
    }));

    try {
      const patternFindings = await (window as any).api.scanFile(selectedFile);
      const content = await (window as any).api.readFile(selectedFile);
      
      const response = await (window as any).api.getAIReview(content, selectedFile);
      
      const aiFindings = (response.findings || []).map((f: any) => ({ ...f, type: 'AI: Security' }));
      const totalFindings = [...patternFindings, ...aiFindings];
      
      setChatHistory(prev => {
        const current = [...(prev[selectedFile] || [])];
        const last = current[current.length - 1];
        if (last) {
          last.findings = totalFindings;
          last.measures = response.measures;
          if (response.reasoning) last.content = response.reasoning;
        }
        return { ...prev, [selectedFile]: current };
      });

      const updatedHistory = [...(chatHistory[selectedFile] || []), newUserMsg, placeholderMsg];
      await saveAIReview(activeProject.id, selectedFile, totalFindings, response.measures || [], response.reasoning, updatedHistory);
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
      const content = await (window as any).api.readFile(selectedFile);
      const existingReview = activeProject.aiReviews?.[selectedFile];
      
      const contextPrompt = `[CONTEXT INJECTION]
File: ${currentFileName}
Code Summary:
\`\`\`
${content.slice(0, 4000)}
\`\`\`
Previous Findings: ${JSON.stringify(existingReview?.findings || [])}`;

      const contextMsg: Message = { role: 'user', content: contextPrompt, isContext: true };
      const userMsg: Message = { role: 'user', content: userText };
      const placeholderMsg: Message = { role: 'assistant', content: "" }; 
      
      const historyBefore = chatHistory[selectedFile] || [];
      const updatedHistory = [...historyBefore, contextMsg, userMsg, placeholderMsg];

      setChatHistory(prev => ({
        ...prev,
        [selectedFile]: updatedHistory
      }));

      const ollamaMessages = updatedHistory.map(m => ({ role: m.role, content: m.content }));
      
      const finalizeText = await (window as any).api.chatWithArchitect(ollamaMessages);
      
      setChatHistory(prev => {
         const current = [...(prev[selectedFile] || [])];
         const last = current[current.length - 1];
         if (last) last.content = finalizeText;
         return { ...prev, [selectedFile]: current };
      });

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
        <div className="p-4 bg-slate-50 rounded-full border border-slate-200 text-slate-300">
          <BrainCircuit className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No AI Context</h2>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-3 text-left">
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
                 <Badge variant="outline" className="text-[9px] height-4 px-2 bg-blue-50 text-blue-600 border-blue-100 font-black uppercase">
                   Context Synchronized
                 </Badge>
               )}
            </div>
          </div>
        </div>
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

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Source Files */}
        <div className="w-72 border-r border-slate-100 bg-slate-50/30 overflow-y-auto flex flex-col shrink-0">
          <div className="p-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-left">
              Project Context
            </h3>
            <div className="space-y-1 text-left">
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
                        ? "bg-white border border-slate-200 shadow-sm shadow-purple-500/5 font-bold" 
                        : "hover:bg-slate-100/50 border border-transparent text-slate-500 font-medium"
                    }`}
                  >
                    <FileCode className={`w-4 h-4 ${isSelected ? "text-purple-600" : "text-slate-400 opacity-60 group-hover:opacity-100"}`} />
                    <span className="text-[13px] truncate flex-1">{fileName}</span>
                    {hasReview && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50/20 relative overflow-hidden">
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
                   <h3 className="text-xl font-bold text-slate-900 tracking-tight text-center">Consult the Architect</h3>
                   <p className="text-sm text-slate-500 max-w-[320px] font-medium leading-relaxed text-center">
                     Lumina-White is ready. Type a question about <span className="text-purple-600 font-bold">{currentFileName}</span> or initiate a deep audit.
                   </p>
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

                  <div className={`flex flex-col gap-4 max-w-[85%] ${msg.role === 'user' ? 'items-end text-right' : 'text-left'}`}>
                    <div className={`p-5 rounded-2xl shadow-sm border ${
                      msg.role === 'user' 
                        ? 'bg-white text-slate-700 border-slate-100 rounded-tr-none' 
                        : 'bg-white text-slate-800 border-slate-100 rounded-tl-none font-medium leading-relaxed'
                    }`}>
                      <div className="text-[14.5px] prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-headings:mb-2 prose-headings:mt-4 first:prose-headings:mt-0 prose-p:mb-2 prose-strong:text-slate-900 prose-strong:font-bold prose-code:text-purple-600 prose-code:bg-purple-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-100">
                        {msg.role === 'assistant' ? (
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                        {isGenerating && idx === currentMessages.length - 1 && !msg.content && (
                          <span className="inline-block w-2 h-4 bg-purple-400 animate-pulse align-middle ml-1" />
                        )}
                      </div>
                    </div>

                    {msg.findings && msg.findings.length > 0 && (
                      <div className="grid grid-cols-1 gap-3 w-full animate-in fade-in zoom-in duration-700 delay-300">
                        {msg.findings.map((finding, fIdx) => (
                          <div key={fIdx} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-purple-200 transition-all group relative overflow-hidden text-left">
                             <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                               finding.severity === 'critical' ? 'bg-red-500' : 
                               finding.severity === 'high' ? 'bg-orange-500' : 'bg-slate-400'
                             }`} />
                             <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                   <h4 className="text-[14px] font-bold text-slate-900">{finding.title}</h4>
                                   <Badge className={`text-[9px] font-black uppercase px-2 py-0.5 border-none rounded-md ${
                                     finding.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                                   }`}>
                                     {finding.severity}
                                   </Badge>
                                </div>
                                <p className="text-xs text-slate-500 font-medium">{finding.description}</p>
                             </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat Input */}
          <div className="p-6 bg-white/50 backdrop-blur-sm border-t border-slate-100 shrink-0">
            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-4">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={selectedFile ? `Explain ${currentFileName} or ask for fixes...` : "Select a file..."}
                disabled={!selectedFile || isGenerating}
                className="flex-1 h-12 px-6 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-purple-500/5 focus:border-purple-600 transition-all shadow-sm"
              />
              <Button 
                type="submit"
                disabled={!inputMessage.trim() || isGenerating}
                className="bg-purple-600 hover:bg-purple-700 h-12 w-12 rounded-2xl p-0 shadow-lg active:scale-95 transition-all text-white flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
