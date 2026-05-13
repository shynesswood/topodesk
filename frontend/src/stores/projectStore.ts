import { create } from 'zustand'
import { TopologyProject } from '../types'

interface ProjectState {
  currentProject: TopologyProject | null
  filePath: string | null
  isDirty: boolean

  hasCurrentProject: () => boolean

  setProject: (project: TopologyProject) => void
  setFilePath: (path: string | null) => void
  markDirty: () => void
  markSaved: () => void
  closeProject: () => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProject: null,
  filePath: null,
  isDirty: false,

  hasCurrentProject: () => get().currentProject !== null,

  setProject: (project) => set({ currentProject: project, isDirty: false }),
  setFilePath: (path) => set({ filePath: path }),
  markDirty: () => set({ isDirty: true }),
  markSaved: () => set({ isDirty: false }),
  closeProject: () => set({ currentProject: null, filePath: null, isDirty: false }),
}))
