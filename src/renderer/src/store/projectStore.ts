import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ScanFinding {
  id: string;
  type: 'security' | 'quality' | 'complexity';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  file: string;
  line: number;
  cwe?: string;
  affectedCode?: string;
  suggestedFix?: string;
}

export interface ProjectMetrics {
  totalFiles: number;
  vulnerabilities: number;
  avgComplexity: number;
  buildStatus: 'Passed' | 'Failed' | 'Running' | 'Pending';
  dockerStats?: {
    cpu: number;
    memory: number;
    buildTime: number;
    runTime: number;
  };
}

export interface Project {
  id: string;
  name: string;
  url: string;
  path: string;
  lastScanned: string;
  status: 'idle' | 'cloning' | 'scanning' | 'running' | 'completed' | 'failed';
  metrics: ProjectMetrics;
  findings: ScanFinding[];
}

interface ProjectState {
  projects: Project[];
  activeProjectId: string | null;
  loadProjects: () => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'status' | 'metrics' | 'findings'>) => Promise<void>;
  removeProject: (id: string) => void;
  setActiveProject: (id: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  getActiveProject: () => Project | null;
}

export const useProjectStore = create<ProjectState>()((set, get) => ({
  projects: [],
  activeProjectId: null,

  loadProjects: async () => {
    console.log("Store: Calling loadProjects...");
    try {
      const projects = await (window as any).api.getProjects();
      console.log("Store: Loaded projects:", projects);
      if (projects && projects.length > 0) {
        set({ projects, activeProjectId: projects[0].id });
      }
    } catch (err) {
      console.error("Failed to load projects from SQLite:", err);
    }
  },

  addProject: async (newProject) => {
    const id = Math.random().toString(36).substring(7);
    const project: Project = {
      ...newProject,
      id,
      status: 'idle',
      lastScanned: 'Never',
      metrics: {
        totalFiles: 0,
        vulnerabilities: 0,
        avgComplexity: 0,
        buildStatus: 'Pending',
      },
      findings: []
    };
    
    try {
      set((state) => ({ 
        projects: [...state.projects, project], 
        activeProjectId: id 
      }));
      await (window as any).api.saveProject(project);
      
      // Automatically start analysis if URL is provided
      if (project.url) {
        await get().startAnalysis(id);
      }
    } catch (err) {
      console.error("Failed to save project to SQLite:", err);
    }
  },

  startAnalysis: async (id: string) => {
    const state = get();
    const project = state.projects.find(p => p.id === id);
    if (!project) return;

    try {
      set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, status: 'cloning' } : p)
      }));

      // 1. Clone Repo
      const cloneData = await (window as any).api.cloneRepo(project.url);
      
      set((state) => ({
        projects: state.projects.map(p => p.id === id ? { 
          ...p, 
          status: 'scanning', 
          path: cloneData.localPath 
        } : p)
      }));

      // 2. Perform Initial Scan
      const metrics = await (window as any).api.analyzeProject(cloneData.localPath);

      const finalProject = {
        ...project,
        path: cloneData.localPath,
        status: 'completed',
        lastScanned: new Date().toLocaleString(),
        metrics
      };

      await (window as any).api.saveProject(finalProject);
      
      set((state) => ({
        projects: state.projects.map(p => p.id === id ? finalProject : p)
      }));

    } catch (err) {
      console.error("Analysis failed:", err);
      set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, status: 'failed' } : p)
      }));
    }
  },

  removeProject: (id) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== id),
    activeProjectId: state.activeProjectId === id ? (state.projects[0]?.id || null) : state.activeProjectId
  })),

  setActiveProject: (id) => set({ activeProjectId: id }),

  updateProject: async (id, updates) => {
    const state = get();
    const updatedProject = state.projects.find(p => p.id === id);
    if (!updatedProject) return;

    const newProject = { ...updatedProject, ...updates };
    
    try {
      set((state) => ({
        projects: state.projects.map((p) => p.id === id ? newProject : p)
      }));
      await (window as any).api.saveProject(newProject);
    } catch (err) {
      console.error("Failed to update project in SQLite:", err);
    }
  },

  getActiveProject: () => {
    const state = get();
    return state.projects.find((p) => p.id === state.activeProjectId) || null;
  }
}));
