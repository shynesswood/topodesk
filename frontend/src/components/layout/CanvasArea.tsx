import React, { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  SelectionMode,
  type OnConnect,
  type OnNodeDrag,
  type NodeMouseHandler,
  type EdgeMouseHandler,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useTopologyStore } from '../../stores/topologyStore'
import { useUIStore } from '../../stores/uiStore'
import { useProjectStore } from '../../stores/projectStore'
import { useThemeColors } from '../../hooks/useThemeColors'
import { TopologyNodeComponent } from '../topology/TopologyNode'
import { TopologyEdgeComponent } from '../topology/TopologyEdge'

const nodeTypes = { 'topology-node': TopologyNodeComponent }
const edgeTypes = { 'topology-edge': TopologyEdgeComponent }

function buildRfNodes(): Node[] {
  const s = useTopologyStore.getState()
  return s.nodes.map((n) => ({
    id: n.id,
    type: 'topology-node',
    position: n.position,
    data: {
      label: n.name,
      nodeType: n.type,
      nodeData: n,
    },
  })) as Node[]
}

function buildRfEdges() {
  const s = useTopologyStore.getState()
  return s.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    type: 'topology-edge',
    data: {
      edgeType: e.type,
      edgeData: e,
    },
  })) as Edge[]
}

export function CanvasArea() {
  const colors = useThemeColors()
  const nodes = useTopologyStore((s) => s.nodes)
  const edgesList = useTopologyStore((s) => s.edges)
  const viewport = useTopologyStore((s) => s.viewport)
  const setNodes = useTopologyStore((s) => s.setNodes)
  const setEdges = useTopologyStore((s) => s.setEdges)
  const addEdge = useTopologyStore((s) => s.addEdge)
  const removeNodes = useTopologyStore((s) => s.removeNodes)
  const removeEdges = useTopologyStore((s) => s.removeEdges)
  const moveNode = useTopologyStore((s) => s.moveNode)

  const openNodePanel = useUIStore((s) => s.openNodePanel)
  const openEdgePanel = useUIStore((s) => s.openEdgePanel)
  const closePanel = useUIStore((s) => s.closePanel)
  const markDirty = useProjectStore((s) => s.markDirty)

  const rfNodes: Node[] = useMemo(() => buildRfNodes(), [nodes])
  const rfEdges: Edge[] = useMemo(() => buildRfEdges(), [edgesList])

  const onNodesChange = useCallback((changes: NodeChange<Node>[]) => {
    const store = useTopologyStore.getState()
    const currentNodes = store.nodes
    const currentRfNodes = currentNodes.map((n) => ({
      id: n.id,
      type: 'topology-node',
      position: n.position,
      data: {
        label: n.name,
        nodeType: n.type,
        nodeData: n,
      },
    })) as Node[]

    const result = applyNodeChanges(changes, currentRfNodes)

    const positionUpdates = new Map<string, { x: number; y: number }>()
    const removeIds = new Set<string>()
    const selectedNodeIds: string[] = []

    changes.forEach((ch) => {
      if (ch.type === 'position' && ch.position) {
        positionUpdates.set(ch.id, ch.position)
      }
      if (ch.type === 'remove') {
        removeIds.add(ch.id)
      }
      if (ch.type === 'select' && ch.selected) {
        selectedNodeIds.push(ch.id)
      }
    })

    if (removeIds.size > 0) {
      store.removeNodes([...removeIds])
    }

    if (positionUpdates.size > 0) {
      setNodes(
        currentNodes.map((n) => {
          const pos = positionUpdates.get(n.id)
          return pos ? { ...n, position: pos } : n
        })
      )
    }
  }, [setNodes])

  const onEdgesChange = useCallback((changes: EdgeChange<Edge>[]) => {
    const store = useTopologyStore.getState()
    const currentEdges = store.edges
    const currentRfEdges = currentEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      type: 'topology-edge',
      data: { edgeType: e.type, edgeData: e },
    }))
    const result = applyEdgeChanges(changes, currentRfEdges)

    const removeIds = new Set<string>()
    changes.forEach((ch) => {
      if (ch.type === 'remove') removeIds.add(ch.id)
    })
    if (removeIds.size > 0) {
      store.removeEdges([...removeIds])
    }
  }, [])

  const onConnect: OnConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return
    addEdge({
      id: '',
      source: connection.source,
      target: connection.target,
    })
    markDirty()
  }, [addEdge, markDirty])

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    openNodePanel(node.id)
  }, [openNodePanel])

  const onEdgeClick: EdgeMouseHandler = useCallback((_event, edge) => {
    openEdgePanel(edge.id)
  }, [openEdgePanel])

  const onPaneClick = useCallback(() => {
    closePanel()
  }, [closePanel])

  const onNodeDragStop: OnNodeDrag = useCallback((_event, node) => {
    moveNode(node.id, node.position)
    markDirty()
  }, [moveNode, markDirty])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultViewport={viewport}
        snapToGrid
        snapGrid={[15, 15]}
        selectionMode={SelectionMode.Partial}
        deleteKeyCode={['Delete', 'Backspace']}
        multiSelectionKeyCode="Shift"
        fitView
        style={{ background: colors.bgCanvas }}
      >
        <Background color={colors.border} gap={20} />
        <Controls />
        <MiniMap
          nodeStrokeColor={colors.border}
          nodeColor={(node) => {
            const data = node.data as { nodeType?: string } | undefined
            const colors: Record<string, string> = {
              'Server': '#4c9aff',
              'Database': '#f5a623',
              'Redis': '#dc3545',
              'MQ': '#6f42c1',
              'Gateway': '#28a745',
              'API': '#17a2b8',
              'External Service': '#6c757d',
            }
            return colors[data?.nodeType || ''] || '#6c757d'
          }}
          maskColor="rgba(0,0,0,0.5)"
        />
      </ReactFlow>
    </div>
  )
}
