import { Outlet, Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  FolderGit2,
  FileSearch,
  Activity,
  Shield,
  BarChart3,
  Sparkles,
  Hammer,
  Container,
  FileText,
  Settings,
  Search,
  User,
  Lock,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useProjectStore } from "../store/projectStore";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";

const navigationItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/repository", icon: FolderGit2, label: "Repository" },
  { path: "/static-analysis", icon: FileSearch, label: "Static Analysis" },
  { path: "/dynamic-analysis", icon: Activity, label: "Dynamic Analysis" },
  { path: "/vulnerabilities", icon: Shield, label: "Vulnerabilities" },
  { path: "/complexity", icon: BarChart3, label: "Complexity" },
  { path: "/ai-review", icon: Sparkles, label: "AI Review" },
  { path: "/build-ci", icon: Hammer, label: "Build & CI" },
  { path: "/container-insights", icon: Container, label: "Container Insights" },
  { path: "/reports", icon: FileText, label: "Reports" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export function MainLayout() {
  const location = useLocation();
  const { projects, activeProjectId, setActiveProject } = useProjectStore();
  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50">
      {/* Top Bar */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 pr-6 border-r border-slate-100">
            <Shield className="w-7 h-7 text-blue-600" />
            <span className="text-xl font-bold tracking-tight text-slate-900">CodeSentinel</span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500">Project:</span>
            <Select value={activeProjectId || ""} onValueChange={setActiveProject}>
              <SelectTrigger className="w-[200px] h-9 bg-slate-50/50 border-slate-200">
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <FolderGit2 className="w-4 h-4 text-blue-500" />
                      <span>{project.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-1 max-w-xl mx-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={`Search in ${activeProject?.name || 'project'}...`}
              className="pl-10 h-9 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-blue-50/50 text-blue-700 border-blue-100 gap-1.5 hidden lg:flex">
            <Lock className="w-3 h-3" />
            Lumina Engine v4.0
          </Badge>
          <div className="h-8 w-[1px] bg-slate-100 mx-1" />
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
            <User className="w-5 h-5 text-slate-600" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 shrink-0 overflow-y-auto">
          <nav className="p-3 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
