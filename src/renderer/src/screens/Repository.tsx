import { useState } from "react";
import { FolderGit2, Upload, Clock, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { useProjectStore } from "../store/projectStore";
import { toast } from "sonner";

export function Repository() {
  const [repoUrl, setRepoUrl] = useState("");
  const { projects, addProject, setActiveProject, removeProject } = useProjectStore();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!repoUrl) return;
    
    setIsConnecting(true);
    try {
      const repoName = repoUrl.split('/').pop() || 'new-project';
      await addProject({
        name: repoName,
        url: repoUrl,
        path: "",
      });
      setRepoUrl("");
      toast.success(`Project ${repoName} initialized for analysis!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to connect repository. check if URL is valid.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this project? Data and local workspace will be removed.")) {
      await removeProject(id);
      toast.success("Project removed successfully");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Workspace</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage your project repositories and analysis environments
          </p>
        </div>
        <Button variant="outline" className="gap-2 border-slate-200">
          <Upload className="w-4 h-4" />
          Bulk Upload
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden bg-gradient-to-r from-blue-50/50 to-white">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FolderGit2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Connect Repository</h3>
                <p className="text-sm text-slate-500">
                  Analyze public or private GitHub repositories
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Input
                placeholder="https://github.com/username/repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="flex-1 h-11 bg-white border-slate-200 focus-visible:ring-blue-500"
              />
              <Button
                onClick={handleConnect}
                disabled={!repoUrl || isConnecting}
                className="bg-blue-600 hover:bg-blue-700 h-11 px-6 font-medium shadow-md shadow-blue-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isConnecting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connecting...
                  </div>
                ) : (
                  "Connect Repository"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Recent Projects</h3>
          <span className="text-sm text-slate-500">{projects.length} Total Projects</span>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {projects.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <FolderGit2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No projects connected yet. Start by adding one above.</p>
            </div>
          ) : (
            projects.map((project) => (
              <Card
                key={project.id}
                onClick={() => setActiveProject(project.id)}
                className="border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group relative bg-white"
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                        <FolderGit2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900">
                            {project.name}
                          </h4>
                          {project.status === 'completed' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                          {project.status === 'cloning' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                          {project.status === 'scanning' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />}
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{project.url}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                       <div className="flex items-center gap-6 text-sm">
                        <div className="text-right">
                          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Vulnerabilities</p>
                          <p className="font-bold text-red-600">
                            {project.metrics?.vulnerabilities ?? 0}
                          </p>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-100" />
                        <div className="text-right">
                          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Complexity</p>
                          <p className="font-bold text-slate-900">
                            {project.metrics?.avgComplexity?.toFixed(1) ?? "0.0"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{project.lastScanned}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => handleDelete(e, project.id)}
                          className="hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="group-hover:translate-x-0.5 transition-transform">
                          <ExternalLink className="w-4 h-4 text-slate-400" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
