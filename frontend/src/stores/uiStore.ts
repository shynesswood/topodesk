import { create } from 'zustand'

type PanelType = 'node' | 'edge' | 'group' | null

interface TerminalEntry {
  id: string
  commandName: string
  commandText: string
  execType: 'local' | 'ssh'
  targetIp?: string
  stdout: string
  stderr: string
  exitCode: number
  error?: string
  timestamp: number
}

interface UIState {
  activePanel: PanelType
  selectedNodeId: string | null
  selectedEdgeId: string | null
  selectedGroupId: string | null
  showMinimap: boolean
  terminalBar: { visible: boolean; height: number; entries: TerminalEntry[]; activeIndex: number }

  openNodePanel: (nodeId: string) => void
  openEdgePanel: (edgeId: string) => void
  openGroupPanel: (groupId: string) => void
  closePanel: () => void
  toggleMinimap: () => void
  showTerminalBar: () => void
  hideTerminalBar: () => void
  setTerminalHeight: (height: number) => void
  addTerminalEntry: (entry: Omit<TerminalEntry, 'id' | 'timestamp'>) => void
  clearTerminalEntries: () => void
  setActiveTerminalIndex: (index: number) => void
}

let terminalEntryCounter = 0

export const useUIStore = create<UIState>((set) => ({
  activePanel: null,
  selectedNodeId: null,
  selectedEdgeId: null,
  selectedGroupId: null,
  showMinimap: true,
  terminalBar: { visible: false, height: 200, entries: [], activeIndex: -1 },

  openNodePanel: (nodeId) => set({ activePanel: 'node', selectedNodeId: nodeId, selectedEdgeId: null, selectedGroupId: null }),
  openEdgePanel: (edgeId) => set({ activePanel: 'edge', selectedEdgeId: edgeId, selectedNodeId: null, selectedGroupId: null }),
  openGroupPanel: (groupId) => set({ activePanel: 'group', selectedGroupId: groupId, selectedNodeId: null, selectedEdgeId: null }),
  closePanel: () => set({ activePanel: null, selectedNodeId: null, selectedEdgeId: null, selectedGroupId: null }),
  toggleMinimap: () => set((s) => ({ showMinimap: !s.showMinimap })),
  showTerminalBar: () => set((s) => ({ terminalBar: { ...s.terminalBar, visible: true } })),
  hideTerminalBar: () => set((s) => ({ terminalBar: { ...s.terminalBar, visible: false } })),
  setTerminalHeight: (height) => set((s) => ({ terminalBar: { ...s.terminalBar, height } })),
  addTerminalEntry: (entry) => set((s) => {
    terminalEntryCounter++
    const newEntry: TerminalEntry = { ...entry, id: `term-${Date.now()}-${terminalEntryCounter}`, timestamp: Date.now() }
    const entries = [...s.terminalBar.entries, newEntry]
    return { terminalBar: { ...s.terminalBar, entries, activeIndex: entries.length - 1, visible: true } }
  }),
  clearTerminalEntries: () => set((s) => ({ terminalBar: { ...s.terminalBar, entries: [], activeIndex: -1 } })),
  setActiveTerminalIndex: (index) => set((s) => ({ terminalBar: { ...s.terminalBar, activeIndex: index } })),
}))
