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
  setViewport: (viewport: Viewport) => void

  addNode: (type: string, name: string, position: XYPosition) => void
  removeNode: (id: string) => void
  removeNodes: (ids: string[]) => void
  updateNode: (id: string, data: Partial<TopologyNode>) => void
  moveNode: (id: string, position: { x: number; y: number }) => void
  duplicateNode: (id: string) => void

  addEdge: (edge: TopologyEdge) => void
  removeEdge: (id: string) => void
  removeEdges: (ids: string[]) => void
  updateEdge: (id: string, data: Partial<TopologyEdge>) => void

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
  setViewport: (viewport) => set({ viewport }),

  addNode: (type, name, position) => {
    const id = generateNodeId()
    const node: TopologyNode = {
      id,
      type,
      name,
      position: { x: position.x, y: position.y },
    }
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

  setSelectedNodeIds: (ids) => set({ selectedNodeIds: ids }),
  setSelectedEdgeIds: (ids) => set({ selectedEdgeIds: ids }),
  clearSelection: () => set({ selectedNodeIds: [], selectedEdgeIds: [] }),

  loadFromProject: (nodes, edges, groups, viewport) => {
    set({ nodes, edges, groups, viewport })
  },
}))
