import { create } from 'zustand'

export interface RecentProject {
  path: string
  name: string
  lastOpened: string
}

interface RecentState {
  recentProjects: RecentProject[]
  addRecent: (path: string, name: string) => void
  removeRecent: (path: string) => void
  clearRecent: () => void
}

const MAX_RECENT = 10

function loadRecent(): RecentProject[] {
  try {
    const stored = localStorage.getItem('topodesk-recent')
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return []
}

function saveRecent(recent: RecentProject[]) {
  try {
    localStorage.setItem('topodesk-recent', JSON.stringify(recent))
  } catch { /* ignore */ }
}

export const useRecentStore = create<RecentState>((set) => ({
  recentProjects: loadRecent(),

  addRecent: (path, name) => {
    set((s) => {
      const filtered = s.recentProjects.filter((p) => p.path !== path)
      const updated = [
        { path, name, lastOpened: new Date().toISOString() },
        ...filtered,
      ].slice(0, MAX_RECENT)
      saveRecent(updated)
      return { recentProjects: updated }
    })
  },

  removeRecent: (path) => {
    set((s) => {
      const updated = s.recentProjects.filter((p) => p.path !== path)
      saveRecent(updated)
      return { recentProjects: updated }
    })
  },

  clearRecent: () => {
    saveRecent([])
    set({ recentProjects: [] })
  },
}))
