import { create } from 'zustand'

type PanelType = 'node' | 'edge' | null

interface UIState {
  activePanel: PanelType
  selectedNodeId: string | null
  selectedEdgeId: string | null
  showMinimap: boolean

  openNodePanel: (nodeId: string) => void
  openEdgePanel: (edgeId: string) => void
  closePanel: () => void
  toggleMinimap: () => void
}

export const useUIStore = create<UIState>((set) => ({
  activePanel: null,
  selectedNodeId: null,
  selectedEdgeId: null,
  showMinimap: true,

  openNodePanel: (nodeId) => set({ activePanel: 'node', selectedNodeId: nodeId, selectedEdgeId: null }),
  openEdgePanel: (edgeId) => set({ activePanel: 'edge', selectedEdgeId: edgeId, selectedNodeId: null }),
  closePanel: () => set({ activePanel: null, selectedNodeId: null, selectedEdgeId: null }),
  toggleMinimap: () => set((s) => ({ showMinimap: !s.showMinimap })),
}))
