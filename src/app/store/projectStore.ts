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
  addProject: (project: Omit<Project, 'id' | 'status' | 'metrics' | 'findings'>) => void;
  removeProject: (id: string) => void;
  setActiveProject: (id: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  getActiveProject: () => Project | null;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [
        {
          id: '1',
          name: 'ecommerce-platform',
          url: 'https://github.com/company/ecommerce-platform',
          path: '/mock/ecommerce',
          lastScanned: '2 hours ago',
          status: 'completed',
          metrics: {
            totalFiles: 1247,
            vulnerabilities: 50,
            avgComplexity: 14.2,
            buildStatus: 'Passed',
            dockerStats: { cpu: 12, memory: 256, buildTime: 45, runTime: 120 }
          },
          findings: [] // Populated by analysis
        }
      ],
      activeProjectId: '1',
      addProject: (newProject) => {
        const id = Math.random().toString(36).substring(7);
        const project: Project = {
          ...newProject,
          id,
          status: 'idle',
          metrics: {
            totalFiles: 0,
            vulnerabilities: 0,
            avgComplexity: 0,
            buildStatus: 'Pending',
          },
          findings: []
        };
        set((state) => ({ projects: [...state.projects, project], activeProjectId: id }));
      },
      removeProject: (id) => set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        activeProjectId: state.activeProjectId === id ? (state.projects[0]?.id || null) : state.activeProjectId
      })),
      setActiveProject: (id) => set({ activeProjectId: id }),
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map((p) => p.id === id ? { ...p, ...updates } : p)
      })),
      getActiveProject: () => {
        const state = get();
        return state.projects.find((p) => p.id === state.activeProjectId) || null;
      }
    }),
    {
      name: 'codesentinel-projects',
    }
  )
);
