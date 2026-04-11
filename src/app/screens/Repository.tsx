import { useState } from "react";
import { FolderGit2, Upload, Clock, ExternalLink } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";

const recentProjects = [
  {
    name: "ecommerce-platform",
    url: "https://github.com/company/ecommerce-platform",
    lastScanned: "2 hours ago",
    files: 1247,
  },
  {
    name: "authentication-service",
    url: "https://github.com/company/authentication-service",
    lastScanned: "1 day ago",
    files: 342,
  },
  {
    name: "payment-gateway",
    url: "https://github.com/company/payment-gateway",
    lastScanned: "3 days ago",
    files: 589,
  },
];

export function Repository() {
  const [repoUrl, setRepoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Repository</h2>
        <p className="text-sm text-slate-500 mt-1">
          Connect to a repository or upload your code
        </p>
      </div>

      {/* GitHub Repository Input */}
      <Card className="border-slate-200">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <FolderGit2 className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Connect GitHub Repository</h3>
                <p className="text-sm text-slate-500">
                  Enter a public repository URL to analyze
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Input
                placeholder="https://github.com/username/repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleConnect}
                disabled={!repoUrl || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Connecting..." : "Connect Repository"}
              </Button>
            </div>

            {isLoading && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-blue-700">Cloning repository...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card className="border-slate-200">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Upload className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Upload Project</h3>
                <p className="text-sm text-slate-500">
                  Drag and drop a ZIP file or click to browse
                </p>
              </div>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-sm font-medium text-slate-700 mb-1">
                Drop your ZIP file here, or click to browse
              </p>
              <p className="text-xs text-slate-500">
                Maximum file size: 100MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Projects */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Recent Projects</h3>
        <div className="space-y-3">
          {recentProjects.map((project) => (
            <Card
              key={project.name}
              className="border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-blue-50 rounded-lg">
                      <FolderGit2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-900">
                          {project.name}
                        </h4>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500">{project.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <p className="text-slate-500">Files</p>
                      <p className="font-semibold text-slate-900">
                        {project.files.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span>{project.lastScanned}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
