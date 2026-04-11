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
  FileText,
  Settings,
  Search,
  User,
  Lock,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

const navigationItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/repository", icon: FolderGit2, label: "Repository" },
  { path: "/static-analysis", icon: FileSearch, label: "Static Analysis" },
  { path: "/dynamic-analysis", icon: Activity, label: "Dynamic Analysis" },
  { path: "/vulnerabilities", icon: Shield, label: "Vulnerabilities" },
  { path: "/complexity", icon: BarChart3, label: "Complexity" },
  { path: "/ai-review", icon: Sparkles, label: "AI Review" },
  { path: "/build-ci", icon: Hammer, label: "Build & CI" },
  { path: "/reports", icon: FileText, label: "Reports" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export function MainLayout() {
  const location = useLocation();

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50">
      {/* Top Bar */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-7 h-7 text-blue-600" />
            <h1 className="text-xl font-semibold text-slate-900">CodeSentinel</h1>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1.5">
            <Lock className="w-3 h-3" />
            100% Local Processing
          </Badge>
        </div>

        <div className="flex items-center gap-4 flex-1 max-w-2xl mx-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search files, functions..."
              className="pl-10 bg-slate-50 border-slate-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700">
            Scan Project
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="w-5 h-5" />
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
