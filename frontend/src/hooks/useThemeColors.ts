import { useSettingsStore, type ThemeMode } from '../stores/settingsStore'

export interface ThemeColors {
  bgPrimary: string
  bgSecondary: string
  bgCanvas: string
  border: string
  textPrimary: string
  textSecondary: string
  nodeBg: string
  nodeBorder: string
  toolbarBg: string
  sidebarBg: string
  panelBg: string
}

const colorMap: Record<ThemeMode, ThemeColors> = {
  dark: {
    bgPrimary: '#0d1117',
    bgSecondary: '#161b22',
    bgCanvas: '#0d1117',
    border: '#30363d',
    textPrimary: '#c9d1d9',
    textSecondary: '#8b949e',
    nodeBg: '#161b22',
    nodeBorder: '#30363d',
    toolbarBg: '#0d1117',
    sidebarBg: '#0d1117',
    panelBg: '#161b22',
  },
  light: {
    bgPrimary: '#ffffff',
    bgSecondary: '#fafafa',
    bgCanvas: '#f5f5f5',
    border: '#d9d9d9',
    textPrimary: '#1f1f1f',
    textSecondary: '#8c8c8c',
    nodeBg: '#ffffff',
    nodeBorder: '#d9d9d9',
    toolbarBg: '#ffffff',
    sidebarBg: '#f5f5f5',
    panelBg: '#ffffff',
  },
}

export function useThemeColors(): ThemeColors {
  const theme = useSettingsStore((s) => s.theme)
  return colorMap[theme]
}
