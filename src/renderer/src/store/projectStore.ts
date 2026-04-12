import { create } from 'zustand';

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
  buildTimeMs?: number;
  startupTimeMs?: number;
  dockerStats?: {
    cpu: string;
    mem: string;
    memUsage: string;
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
  buildLogs?: string[];
  sandboxStatus?: 'stopped' | 'building' | 'running';
}

interface ProjectState {
  projects: Project[];
  activeProjectId: string | null;
  scanProgress: number;
  scanningFile: string | null;
  scanStartTime: number | null;
  estimatedRemainingSeconds: number | null;
  loadProjects: () => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'status' | 'metrics' | 'findings'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  getActiveProject: () => Project | null;
  reScanProject: (id: string) => Promise<void>;
  setActiveProject: (id: string) => void;
  removeProject: (id: string) => Promise<void>;
  startDynamicRun: (id: string) => Promise<void>;
}

// Shared findings mapper — handles both StaticFinding and AIReviewResult shapes
function mapFindings(findings: any[]): ScanFinding[] {
  return (findings || []).map((f: any) => ({
    id: Math.random().toString(36).substring(7),
    type: f.type?.startsWith('AI:') ? 'security' as const : 'quality' as const,
    severity: (f.severity || 'low').toLowerCase() as ScanFinding['severity'],
    title: f.title || f.issue || f.message || f.type || 'Logic Finding',
    description: f.description || f.recommendation || '',
    file: f.file || '',
    line: f.line || 0,
    affectedCode: f.snippet || f.affectedCode || '',
    suggestedFix: f.suggestedFix || f.recommendation || ''
  }));
}

export const useProjectStore = create<ProjectState>()((set, get) => ({
  projects: [],
  activeProjectId: null,
  scanProgress: 0,
  scanningFile: null,
  scanStartTime: null,
  estimatedRemainingSeconds: null,

  loadProjects: async () => {
    try {
      const projects = await (window as any).api.getProjects();
      if (projects && projects.length > 0) {
        set({ projects, activeProjectId: projects[0].id });
      }
    } catch (err) {
      console.error('[Store] Failed to load projects:', err);
    }
  },

  addProject: async (newProject) => {
    const id = Math.random().toString(36).substring(7);
    const project: Project = {
      ...newProject,
      id,
      status: 'idle',
      lastScanned: 'Never',
      metrics: { totalFiles: 0, vulnerabilities: 0, avgComplexity: 0, buildStatus: 'Pending' },
      findings: []
    };

    // Add to UI immediately
    set((state) => ({
      projects: [...state.projects, project],
      activeProjectId: id
    }));
    await (window as any).api.saveProject(project);

    // STEP 1: Clone
    try {
      set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, status: 'cloning' } : p)
      }));

      const cloneData = await (window as any).api.cloneRepo(project.url);
      const clonedPath = cloneData.localPath;

      // STEP 2: Move to scanning state with actual path
      set((state) => ({
        projects: state.projects.map(p => p.id === id
          ? { ...p, status: 'scanning', path: clonedPath }
          : p
        ),
        scanStartTime: Date.now(),
        scanProgress: 1
      }));

      // STEP 3: Analyze
      const { metrics, findings } = await (window as any).api.analyzeProject(clonedPath);
      const storeFindings = mapFindings(findings);

      const finalProject: Project = {
        ...project,
        path: clonedPath,
        status: 'completed',
        lastScanned: new Date().toLocaleString(),
        metrics: {
          ...metrics,
          vulnerabilities: storeFindings.filter(f => f.severity === 'critical' || f.severity === 'high').length,
          buildStatus: 'Passed'
        },
        findings: storeFindings
      };

      await (window as any).api.saveProject(finalProject);
      set((state) => ({
        projects: state.projects.map(p => p.id === id ? finalProject : p),
        scanProgress: 100,
        scanningFile: null,
        estimatedRemainingSeconds: null,
        scanStartTime: null
      }));

    } catch (err) {
      console.error('[Store] Clone/Analyze failed:', err);
      set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, status: 'failed' } : p),
        scanStartTime: null,
        estimatedRemainingSeconds: null
      }));
    }
  },

  reScanProject: async (id: string) => {
    const state = get();
    const project = state.projects.find(p => p.id === id);
    if (!project || !project.path) {
      console.error('[Store] Cannot re-scan: project has no local path');
      return;
    }

    try {
      set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, status: 'scanning' } : p),
        scanStartTime: Date.now(),
        scanProgress: 1
      }));

      const { metrics, findings } = await (window as any).api.analyzeProject(project.path);
      const storeFindings = mapFindings(findings);

      const updatedProject: Project = {
        ...project,
        status: 'completed',
        lastScanned: new Date().toLocaleString(),
        metrics: {
          ...metrics,
          vulnerabilities: storeFindings.filter(f => f.severity === 'critical' || f.severity === 'high').length,
          buildStatus: 'Passed'
        },
        findings: storeFindings
      };

      set((state) => ({
        projects: state.projects.map(p => p.id === id ? updatedProject : p),
        scanProgress: 100,
        scanningFile: null,
        estimatedRemainingSeconds: null,
        scanStartTime: null
      }));
      await (window as any).api.saveProject(updatedProject);
    } catch (err) {
      console.error('[Store] Re-scan failed:', err);
      set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, status: 'failed' } : p),
        scanStartTime: null,
        estimatedRemainingSeconds: null
      }));
    }
  },

  startDynamicRun: async (id: string) => {
    const state = get();
    const project = state.projects.find(p => p.id === id);
    if (!project) return;

    try {
      set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, sandboxStatus: 'building' } : p)
      }));

      // Build image of the REPO (not CodeSentinel)
      const buildTimeMs = await (window as any).api.dockerBuild(id, project.path);

      // Run the repo container
      const runResultRaw = await (window as any).api.dockerRun(id);
      let startupTimeMs = 0;
      try {
        const parsed = JSON.parse(runResultRaw);
        startupTimeMs = parsed.runTime || 0;
      } catch { /* may return plain containerName string on older builds */ }

      const updated: Project = {
        ...project,
        sandboxStatus: 'running',
        metrics: {
          ...project.metrics,
          buildTimeMs: typeof buildTimeMs === 'number' ? buildTimeMs : 0,
          startupTimeMs
        }
      };

      set((state) => ({
        projects: state.projects.map(p => p.id === id ? updated : p)
      }));
      await (window as any).api.saveProject(updated);
    } catch (err) {
      console.error('[Store] Dynamic run failed:', err);
      set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, sandboxStatus: 'stopped' } : p)
      }));
    }
  },

  removeProject: async (id) => {
    const state = get();
    const project = state.projects.find(p => p.id === id);
    if (!project) return;
    try {
      await (window as any).api.deleteProject(id, project.path);
      const remaining = state.projects.filter(p => p.id !== id);
      set({
        projects: remaining,
        activeProjectId: state.activeProjectId === id
          ? (remaining[0]?.id || null)
          : state.activeProjectId
      });
    } catch (err) {
      console.error('[Store] Delete failed:', err);
    }
  },

  setActiveProject: (id) => set({ activeProjectId: id }),

  updateProject: async (id, updates) => {
    const state = get();
    const project = state.projects.find(p => p.id === id);
    if (!project) return;
    const updated = { ...project, ...updates };
    set((state) => ({
      projects: state.projects.map(p => p.id === id ? updated : p)
    }));
    await (window as any).api.saveProject(updated);
  },

  getActiveProject: () => {
    const state = get();
    return state.projects.find(p => p.id === state.activeProjectId) || null;
  }
}));

// Real-time ETA calculation from IPC progress events
if (typeof window !== 'undefined' && (window as any).api?.onAnalysisProgress) {
  (window as any).api.onAnalysisProgress((p: { progress: number; file: string }) => {
    const { scanStartTime } = useProjectStore.getState();
    let eta: number | null = null;

    // Only start showing ETA after 5% to ensure stable estimate
    if (scanStartTime && p.progress > 5) {
      const elapsed = (Date.now() - scanStartTime) / 1000;
      const totalEstimated = elapsed / (p.progress / 100);
      eta = Math.max(0, Math.floor(totalEstimated - elapsed));
    }

    useProjectStore.setState({
      scanProgress: p.progress,
      scanningFile: p.file,
      estimatedRemainingSeconds: eta
    });
  });
}
