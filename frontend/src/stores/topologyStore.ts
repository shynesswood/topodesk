import { Edge, Node, XYPosition } from '@xyflow/react'
import { create } from 'zustand'
import { TopologyNode, TopologyEdge, Group, Viewport } from '../types'

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
  getReactFlowNodes: () => Node[]
  getReactFlowEdges: () => Edge[]
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

export const useTopologyStore = create<TopologyState>((set, get) => ({
  nodes: [],
  edges: [],
  groups: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  selectedNodeIds: [],
  selectedEdgeIds: [],

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
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
  },

  removeNode: (id) => {
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id),
    }))
  },

  removeNodes: (ids) => {
    set((s) => ({
      nodes: s.nodes.filter((n) => !ids.includes(n.id)),
      edges: s.edges.filter((e) => !ids.includes(e.source) && !ids.includes(e.target)),
    }))
  },

  updateNode: (id, data) => {
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, ...data } : n)),
    }))
  },

  moveNode: (id, position) => {
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, position } : n)),
    }))
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
  },

  addEdge: (edge) => {
    const id = edge.id || generateEdgeId()
    set((s) => ({ edges: [...s.edges, { ...edge, id }] }))
  },

  removeEdge: (id) => {
    set((s) => ({ edges: s.edges.filter((e) => e.id !== id) }))
  },

  removeEdges: (ids) => {
    set((s) => ({ edges: s.edges.filter((e) => !ids.includes(e.id)) }))
  },

  updateEdge: (id, data) => {
    set((s) => ({
      edges: s.edges.map((e) => (e.id === id ? { ...e, ...data } : e)),
    }))
  },

  setSelectedNodeIds: (ids) => set({ selectedNodeIds: ids }),
  setSelectedEdgeIds: (ids) => set({ selectedEdgeIds: ids }),
  clearSelection: () => set({ selectedNodeIds: [], selectedEdgeIds: [] }),

  loadFromProject: (nodes, edges, groups, viewport) => {
    set({ nodes, edges, groups, viewport })
  },

  getReactFlowNodes: () => {
    return get().nodes.map((n) => ({
      id: n.id,
      type: 'topology-node',
      position: n.position,
      data: { label: n.name, nodeType: n.type, nodeData: n },
    }))
  },

  getReactFlowEdges: () => {
    return get().edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      type: 'topology-edge',
      data: { edgeType: e.type },
    }))
  },
}))
