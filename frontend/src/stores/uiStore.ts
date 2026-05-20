import { create } from 'zustand'

type PanelType = 'node' | 'edge' | 'group' | null

interface UIState {
  activePanel: PanelType
  selectedNodeId: string | null
  selectedEdgeId: string | null
  selectedGroupId: string | null
  showMinimap: boolean

  openNodePanel: (nodeId: string) => void
  openEdgePanel: (edgeId: string) => void
  openGroupPanel: (groupId: string) => void
  closePanel: () => void
  toggleMinimap: () => void
}

export const useUIStore = create<UIState>((set) => ({
  activePanel: null,
  selectedNodeId: null,
  selectedEdgeId: null,
  selectedGroupId: null,
  showMinimap: true,

  openNodePanel: (nodeId) => set({ activePanel: 'node', selectedNodeId: nodeId, selectedEdgeId: null, selectedGroupId: null }),
  openEdgePanel: (edgeId) => set({ activePanel: 'edge', selectedEdgeId: edgeId, selectedNodeId: null, selectedGroupId: null }),
  openGroupPanel: (groupId) => set({ activePanel: 'group', selectedGroupId: groupId, selectedNodeId: null, selectedEdgeId: null }),
  closePanel: () => set({ activePanel: null, selectedNodeId: null, selectedEdgeId: null, selectedGroupId: null }),
  toggleMinimap: () => set((s) => ({ showMinimap: !s.showMinimap })),
}))
