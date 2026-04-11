import { useState, useEffect, useMemo } from "react";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  AlertTriangle,
  AlertCircle,
  Info,
  Search,
  Code2,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { useProjectStore } from "../store/projectStore";
import { Input } from "../components/ui/input";

// Helper to convert flat paths to nested tree structure
const buildFileTree = (paths: string[], rootPath: string) => {
  const tree: any[] = [];
  
  paths.forEach(fullPath => {
    // Get relative path from project root
    const relPath = fullPath.replace(rootPath, "").replace(/^[\\\/]/, "");
    const parts = relPath.split(/[\\\/]/);
    
    let currentLevel = tree;
    
    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      let existing = currentLevel.find(item => item.name === part);
      
      if (!existing) {
        existing = {
          name: part,
          path: fullPath,
          type: isLast ? 'file' : 'folder',
          children: isLast ? undefined : []
        };
        currentLevel.push(existing);
      }
      
      if (!isLast) {
        currentLevel = existing.children;
      }
    });
  });
  
  // Sort: folders first, then files alphabetically
  const sortTree = (nodes: any[]) => {
    return nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    }).map(node => {
      if (node.children) node.children = sortTree(node.children);
      return node;
    });
  };

  return sortTree(tree);
};

function FileTreeItem({ item, level = 0, onSelect, selectedPath }: { 
  item: any; 
  level?: number; 
  onSelect: (path: string) => void;
  selectedPath: string | null;
}) {
  const [isOpen, setIsOpen] = useState(level < 1);
  const isSelected = selectedPath === item.path;

  if (item.type === "file") {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer transition-colors ${
          isSelected ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50 text-slate-700"
        }`}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
        onClick={() => onSelect(item.path)}
      >
        <File className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
        <span className={`text-sm ${isSelected ? "font-semibold" : ""}`}>{item.name}</span>
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 rounded cursor-pointer group"
        style={{ paddingLeft: `${level * 12 + 12}px` }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
        <Folder className="w-4 h-4 text-blue-500 fill-blue-500/10" />
        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{item.name}</span>
      </div>
      {isOpen && item.children && (
        <div>
          {item.children.map((child: any, index: number) => (
            <FileTreeItem 
              key={index} 
              item={child} 
              level={level + 1} 
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function StaticAnalysis() {
  const { getActiveProject } = useProjectStore();
  const activeProject = getActiveProject();
  
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [code, setCode] = useState<string>("");
  const [findings, setFindings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const treeData = useMemo(() => {
    if (!activeProject || files.length === 0) return [];
    return buildFileTree(files, activeProject.path);
  }, [files, activeProject]);

  useEffect(() => {
    if (activeProject?.path) {
      loadFiles();
    }
  }, [activeProject?.id]);

  const loadFiles = async () => {
    try {
      const allFiles = await (window as any).api.getFiles(activeProject?.path);
      setFiles(allFiles);
      if (allFiles.length > 0 && !selectedFile) {
        handleFileSelect(allFiles[0]);
      }
    } catch (err) {
      console.error("Failed to load project files:", err);
    }
  };

  const handleFileSelect = async (path: string) => {
    setSelectedFile(path);
    setIsLoading(true);
    try {
      const content = await (window as any).api.readFile(path);
      setCode(content);
      
      const scanResults = await (window as any).api.scanFile(path);
      setFindings(scanResults);
    } catch (err) {
      console.error("Failed to analyze file:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 animate-in fade-in duration-500">
        <div className="p-4 bg-slate-100 rounded-full">
          <Code2 className="w-12 h-12 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Workspace Selection Required</h2>
        <p className="text-slate-500 max-w-xs text-center">Please select or connect a repository to begin real-time code auditing.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Static Analysis</h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time pattern matching and architectural auditing for <span className="text-blue-600 font-semibold">{activeProject.name}</span>
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 py-1.5 px-3">
          Scanner Engine v1.2
        </Badge>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer */}
        <div className="w-80 border-r border-slate-200 bg-slate-50/20 flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-white/50">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-white border-slate-200 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-0.5">
              {treeData.map((item, index) => (
                <FileTreeItem 
                  key={index} 
                  item={item} 
                  onSelect={handleFileSelect}
                  selectedPath={selectedFile}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Center Panel: Code + Issues */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
                <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <File className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-mono text-slate-300">
                      {selectedFile ? selectedFile.split(/[\\/]/).pop() : "No file selected"}
                    </span>
                  </div>
                  <Badge className="bg-slate-700 text-slate-300 border-none text-[10px] uppercase font-bold tracking-wider">
                    {selectedFile?.split('.').pop() || 'Text'}
                  </Badge>
                </div>
                <div className="p-6 relative">
                  {isLoading && (
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-10">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <pre className="text-sm font-mono leading-relaxed text-slate-300 overflow-x-auto">
                    <code>{code || "// Select a file to view its contents..."}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Issues Panel */}
          <div className="h-72 border-t border-slate-200 bg-slate-50/50 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Issues Detected
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-black ml-2">
                  {findings.length}
                </Badge>
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {findings.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                  <ShieldCheck className="w-10 h-10 opacity-20" />
                  <p className="text-xs font-medium uppercase tracking-widest">No issues identified in current buffer</p>
                </div>
              ) : (
                findings.map((issue, index) => {
                  const Icon =
                    issue.severity === "critical"
                      ? AlertCircle
                      : issue.severity === "warning"
                      ? AlertTriangle
                      : Info;

                  return (
                    <div
                      key={index}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all cursor-default group"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg shrink-0 ${
                          issue.severity === "critical" ? "bg-red-50 text-red-600" :
                          issue.severity === "warning" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                              issue.severity === "critical" ? "bg-red-100 text-red-700" :
                              issue.severity === "warning" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                            }`}>
                              {issue.type}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              Line {issue.line}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {issue.message}
                          </p>
                          <p className="text-xs text-slate-500 leading-relaxed italic">
                            {issue.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Missing icon from thinking
function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"></path>
      <path d="m9 12 2 2 4-4"></path>
    </svg>
  );
}
