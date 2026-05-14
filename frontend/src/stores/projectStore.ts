import { create } from 'zustand'
import { TopologyProject } from '../types'
import { NewProject } from '../services/projectService'

interface ProjectState {
  currentProject: TopologyProject | null
  filePath: string | null
  isDirty: boolean

  hasCurrentProject: () => boolean
  hasFilePath: () => boolean

  createBlank: () => Promise<void>
  setProject: (project: TopologyProject) => void
  setFilePath: (path: string | null) => void
  markDirty: () => void
  markSaved: () => void
  setCurrentProjectName: (name: string) => void
  closeProject: () => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProject: null,
  filePath: null,
  isDirty: false,

  hasCurrentProject: () => get().currentProject !== null,
  hasFilePath: () => get().filePath !== null,

  createBlank: async () => {
    const project = await NewProject('未命名项目')
    set({ currentProject: project, filePath: null, isDirty: false })
  },

  setProject: (project) => set({ currentProject: project, isDirty: false }),
  setFilePath: (path) => set({ filePath: path }),
  markDirty: () => set({ isDirty: true }),
  markSaved: () => set({ isDirty: false }),

  setCurrentProjectName: (name) => {
    const p = get().currentProject
    if (!p) return
    set({
      currentProject: {
        ...p,
        project: { ...p.project, name },
      },
    })
  },

  closeProject: () => set({ currentProject: null, filePath: null, isDirty: false }),
}))
