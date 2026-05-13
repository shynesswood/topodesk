import { create } from 'zustand'

export type ThemeMode = 'dark' | 'light'

interface SettingsState {
  theme: ThemeMode

  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

function loadTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem('topodesk-theme')
    if (stored === 'dark' || stored === 'light') return stored
  } catch { /* ignore */ }
  return 'dark'
}

function saveTheme(theme: ThemeMode) {
  try {
    localStorage.setItem('topodesk-theme', theme)
  } catch { /* ignore */ }
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: loadTheme(),

  setTheme: (theme) => {
    saveTheme(theme)
    set({ theme })
  },

  toggleTheme: () => {
    set((s) => {
      const next = s.theme === 'dark' ? 'light' : 'dark'
      saveTheme(next)
      return { theme: next }
    })
  },
}))
