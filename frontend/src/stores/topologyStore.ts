import { create } from 'zustand'
import { TopologyNode, TopologyEdge, Group, Viewport } from '../types'
import { XYPosition } from '@xyflow/react'
import { useProjectStore } from './projectStore'

interface TopologyState {
  nodes: TopologyNode[]
  edges: TopologyEdge[]
  groups: Group[]
  viewport: Viewport

  selectedNodeIds: string[]
  selectedEdgeIds: string[]

  setNodes: (nodes: TopologyNode[]) => void
  setEdges: (edges: TopologyEdge[]) => void
  setGroups: (groups: Group[]) => void
  setViewport: (viewport: Viewport) => void

  addNode: (name: string, position: XYPosition) => void
  removeNode: (id: string) => void
  removeNodes: (ids: string[]) => void
  updateNode: (id: string, data: Partial<TopologyNode>) => void
  moveNode: (id: string, position: { x: number; y: number }) => void
  duplicateNode: (id: string) => void

  addEdge: (edge: TopologyEdge) => void
  removeEdge: (id: string) => void
  removeEdges: (ids: string[]) => void
  updateEdge: (id: string, data: Partial<TopologyEdge>) => void

  addGroup: (name: string, nodeIds: string[], color?: string, position?: { x: number; y: number }) => void
  removeGroup: (id: string) => void
  updateGroup: (id: string, data: Partial<Group>) => void
  moveGroupPosition: (id: string, position: { x: number; y: number }) => void
  resizeGroup: (id: string, width: number, height: number, position?: { x: number; y: number }) => void
  addNodesToGroup: (groupId: string, nodeIds: string[]) => void
  removeNodesFromGroup: (groupId: string, nodeIds: string[]) => void

  setSelectedNodeIds: (ids: string[]) => void
  setSelectedEdgeIds: (ids: string[]) => void
  clearSelection: () => void

  loadFromProject: (nodes: TopologyNode[], edges: TopologyEdge[], groups: Group[], viewport: Viewport) => void
}

let nodeCounter = 0
let edgeCounter = 0

function generateNodeId(): string {
  nodeCounter++
  return `node-${Date.now()}-${nodeCounter}`
}

function generateEdgeId(): string {
  edgeCounter++
  return `edge-${Date.now()}-${edgeCounter}`
}

function markDirty() {
  const p = useProjectStore.getState()
  if (p.currentProject) {
    p.markDirty()
  }
}

export const useTopologyStore = create<TopologyState>((set, get) => ({
  nodes: [],
  edges: [],
  groups: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  selectedNodeIds: [],
  selectedEdgeIds: [],

  setNodes: (nodes) => { set({ nodes }); markDirty() },
  setEdges: (edges) => { set({ edges }); markDirty() },
  setGroups: (groups) => { set({ groups }); markDirty() },
  setViewport: (viewport) => set({ viewport }),

  addNode: (name, position) => {
    const id = generateNodeId()
    const node: TopologyNode = { id, name, position: { x: position.x, y: position.y } }
    set((s) => ({ nodes: [...s.nodes, node] }))
    markDirty()
  },

  removeNode: (id) => {
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id),
    }))
    markDirty()
  },

  removeNodes: (ids) => {
    set((s) => ({
      nodes: s.nodes.filter((n) => !ids.includes(n.id)),
      edges: s.edges.filter((e) => !ids.includes(e.source) && !ids.includes(e.target)),
    }))
    markDirty()
  },

  updateNode: (id, data) => {
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, ...data } : n)),
    }))
    markDirty()
  },

  moveNode: (id, position) => {
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, position } : n)),
    }))
    markDirty()
  },

  duplicateNode: (id) => {
    const source = get().nodes.find((n) => n.id === id)
    if (!source) return
    const newNode: TopologyNode = {
      ...JSON.parse(JSON.stringify(source)),
      id: generateNodeId(),
      name: `${source.name} (copy)`,
      position: { x: source.position.x + 50, y: source.position.y + 50 },
    }
    set((s) => ({ nodes: [...s.nodes, newNode] }))
    markDirty()
  },

  addEdge: (edge) => {
    const id = edge.id || generateEdgeId()
    set((s) => ({ edges: [...s.edges, { ...edge, id }] }))
    markDirty()
  },

  removeEdge: (id) => {
    set((s) => ({ edges: s.edges.filter((e) => e.id !== id) }))
    markDirty()
  },

  removeEdges: (ids) => {
    set((s) => ({ edges: s.edges.filter((e) => !ids.includes(e.id)) }))
    markDirty()
  },

  updateEdge: (id, data) => {
    set((s) => ({
      edges: s.edges.map((e) => (e.id === id ? { ...e, ...data } : e)),
    }))
    markDirty()
  },

  addGroup: (name, nodeIds, color?, position?) => {
    const id = `group-${Date.now()}`
    const defaultColors = ['rgba(76, 154, 255, 0.08)', 'rgba(82, 196, 26, 0.08)', 'rgba(250, 173, 20, 0.08)', 'rgba(255, 77, 79, 0.08)', 'rgba(114, 46, 209, 0.08)', 'rgba(19, 194, 194, 0.08)']
    const groupColor = color || defaultColors[Math.floor(Math.random() * defaultColors.length)]
    set((s) => ({ groups: [...s.groups, {
      id, name, color: groupColor, nodeIds,
      position: position || { x: 150, y: 150 },
      width: 300,
      height: 200,
    }] }))
    markDirty()
  },

  removeGroup: (id) => {
    set((s) => ({ groups: s.groups.filter((g) => g.id !== id) }))
    markDirty()
  },

  updateGroup: (id, data) => {
    set((s) => ({
      groups: s.groups.map((g) => (g.id === id ? { ...g, ...data } : g)),
    }))
    markDirty()
  },

  moveGroupPosition: (id, position) => {
    set((s) => ({
      groups: s.groups.map((g) => (g.id === id ? { ...g, position } : g)),
    }))
    markDirty()
  },

  resizeGroup: (id, width, height, position?) => {
    set((s) => ({
      groups: s.groups.map((g) => {
        if (g.id !== id) return g
        const updated: Group = { ...g, width, height }
        if (position) updated.position = position
        return updated
      }),
    }))
    markDirty()
  },

  addNodesToGroup: (groupId, nodeIds) => {
    set((s) => ({
      groups: s.groups.map((g) => {
        if (g.id !== groupId) return g
        const existing = new Set(g.nodeIds)
        const newIds = nodeIds.filter((id) => !existing.has(id))
        return { ...g, nodeIds: [...g.nodeIds, ...newIds] }
      }),
    }))
    markDirty()
  },

  removeNodesFromGroup: (groupId, nodeIds) => {
    set((s) => ({
      groups: s.groups.map((g) => {
        if (g.id !== groupId) return g
        const removeSet = new Set(nodeIds)
        return { ...g, nodeIds: g.nodeIds.filter((id) => !removeSet.has(id)) }
      }),
    }))
    markDirty()
  },

  setSelectedNodeIds: (ids) => set({ selectedNodeIds: ids }),
  setSelectedEdgeIds: (ids) => set({ selectedEdgeIds: ids }),
  clearSelection: () => set({ selectedNodeIds: [], selectedEdgeIds: [] }),

  loadFromProject: (nodes, edges, groups, viewport) => {
    set({ nodes, edges, groups, viewport })
  },
}))
