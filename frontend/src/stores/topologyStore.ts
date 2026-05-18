import { create } from 'zustand'
import { TopologyNode, TopologyEdge, Group, Viewport } from '../types'
import { XYPosition } from '@xyflow/react'
import { useProjectStore } from './projectStore'

interface Snapshot {
  nodes: TopologyNode[]
  edges: TopologyEdge[]
  groups: Group[]
  viewport: Viewport
}

interface TopologyState {
  nodes: TopologyNode[]
  edges: TopologyEdge[]
  groups: Group[]
  viewport: Viewport

  selectedNodeIds: string[]
  selectedEdgeIds: string[]

  history: Snapshot[]
  historyIndex: number

  setNodes: (nodes: TopologyNode[]) => void
  setEdges: (edges: TopologyEdge[]) => void
  setGroups: (groups: Group[]) => void
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

  addGroup: (name: string, nodeIds: string[]) => void
  removeGroup: (id: string) => void
  updateGroup: (id: string, data: Partial<Group>) => void
  addNodesToGroup: (groupId: string, nodeIds: string[]) => void
  removeNodesFromGroup: (groupId: string, nodeIds: string[]) => void

  pushSnapshot: () => void
  undo: () => void
  redo: () => void

  setSelectedNodeIds: (ids: string[]) => void
  setSelectedEdgeIds: (ids: string[]) => void
  clearSelection: () => void

  loadFromProject: (nodes: TopologyNode[], edges: TopologyEdge[], groups: Group[], viewport: Viewport) => void
}

let nodeCounter = 0
let edgeCounter = 0
let _restoring = false
let _lastSnapshotTime = 0
const SNAPSHOT_DEBOUNCE = 300
const MAX_HISTORY = 50

function cloneSnapshot(snapshot: Snapshot): Snapshot {
  return JSON.parse(JSON.stringify(snapshot))
}

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

  history: [],
  historyIndex: -1,

  pushSnapshot: () => {
    if (_restoring) return
    const now = Date.now()
    if (now - _lastSnapshotTime < SNAPSHOT_DEBOUNCE) return
    _lastSnapshotTime = now

    const s = get()
    const snap: Snapshot = {
      nodes: cloneSnapshot(s.nodes as unknown as Snapshot).nodes,
      edges: cloneSnapshot(s.edges as unknown as Snapshot).edges,
      groups: cloneSnapshot(s.groups as unknown as Snapshot).groups,
      viewport: { ...s.viewport },
    }
    const newHistory = s.history.slice(0, s.historyIndex + 1)
    newHistory.push(snap)
    if (newHistory.length > MAX_HISTORY) newHistory.shift()
    set({ history: newHistory, historyIndex: newHistory.length - 1 })
  },

  undo: () => {
    const s = get()
    if (s.historyIndex < 0) return
    _restoring = true
    const snap = s.history[s.historyIndex]
    set({
      nodes: cloneSnapshot(snap).nodes,
      edges: cloneSnapshot(snap).edges,
      groups: cloneSnapshot(snap).groups,
      viewport: { ...snap.viewport },
      historyIndex: s.historyIndex - 1,
    })
    markDirty()
    _restoring = false
  },

  redo: () => {
    const s = get()
    if (s.historyIndex >= s.history.length - 1) return
    _restoring = true
    const snap = s.history[s.historyIndex + 1]
    set({
      nodes: cloneSnapshot(snap).nodes,
      edges: cloneSnapshot(snap).edges,
      groups: cloneSnapshot(snap).groups,
      viewport: { ...snap.viewport },
      historyIndex: s.historyIndex + 1,
    })
    markDirty()
    _restoring = false
  },

  setNodes: (nodes) => { set({ nodes }); markDirty() },
  setEdges: (edges) => { set({ edges }); markDirty() },
  setGroups: (groups) => { set({ groups }); markDirty() },
  setViewport: (viewport) => set({ viewport }),

  addNode: (type, name, position) => {
    get().pushSnapshot()
    const id = generateNodeId()
    const node: TopologyNode = { id, type, name, position: { x: position.x, y: position.y } }
    set((s) => ({ nodes: [...s.nodes, node] }))
    markDirty()
  },

  removeNode: (id) => {
    get().pushSnapshot()
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id),
    }))
    markDirty()
  },

  removeNodes: (ids) => {
    get().pushSnapshot()
    set((s) => ({
      nodes: s.nodes.filter((n) => !ids.includes(n.id)),
      edges: s.edges.filter((e) => !ids.includes(e.source) && !ids.includes(e.target)),
    }))
    markDirty()
  },

  updateNode: (id, data) => {
    get().pushSnapshot()
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, ...data } : n)),
    }))
    markDirty()
  },

  moveNode: (id, position) => {
    get().pushSnapshot()
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, position } : n)),
    }))
    markDirty()
  },

  duplicateNode: (id) => {
    get().pushSnapshot()
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
    get().pushSnapshot()
    const id = edge.id || generateEdgeId()
    set((s) => ({ edges: [...s.edges, { ...edge, id }] }))
    markDirty()
  },

  removeEdge: (id) => {
    get().pushSnapshot()
    set((s) => ({ edges: s.edges.filter((e) => e.id !== id) }))
    markDirty()
  },

  removeEdges: (ids) => {
    get().pushSnapshot()
    set((s) => ({ edges: s.edges.filter((e) => !ids.includes(e.id)) }))
    markDirty()
  },

  updateEdge: (id, data) => {
    get().pushSnapshot()
    set((s) => ({
      edges: s.edges.map((e) => (e.id === id ? { ...e, ...data } : e)),
    }))
    markDirty()
  },

  addGroup: (name, nodeIds) => {
    get().pushSnapshot()
    const id = `group-${Date.now()}`
    set((s) => ({ groups: [...s.groups, { id, name, nodeIds }] }))
    markDirty()
  },

  removeGroup: (id) => {
    get().pushSnapshot()
    set((s) => ({ groups: s.groups.filter((g) => g.id !== id) }))
    markDirty()
  },

  updateGroup: (id, data) => {
    get().pushSnapshot()
    set((s) => ({
      groups: s.groups.map((g) => (g.id === id ? { ...g, ...data } : g)),
    }))
    markDirty()
  },

  addNodesToGroup: (groupId, nodeIds) => {
    get().pushSnapshot()
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
    get().pushSnapshot()
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
    set({ nodes, edges, groups, viewport, history: [], historyIndex: -1 })
  },
}))
