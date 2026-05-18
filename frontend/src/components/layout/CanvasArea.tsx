import { useCallback, useMemo } from 'react'
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
import { useThemeColors } from '../../hooks/useThemeColors'
import { TopologyNodeComponent } from '../topology/TopologyNode'
import { GroupNodeComponent } from '../topology/GroupNode'
import { TopologyEdgeComponent } from '../topology/TopologyEdge'
import type { TopologyNode } from '../../types'

const nodeTypes = {
  'topology-node': TopologyNodeComponent,
  'topology-group': GroupNodeComponent,
}
const edgeTypes = { 'topology-edge': TopologyEdgeComponent }

const GROUP_PADDING = 40
const NODE_WIDTH = 160
const NODE_HEIGHT = 80

function buildAllRfNodes(nodesArr: TopologyNode[], groupsArr: { id: string; name: string; color?: string; nodeIds: string[] }[]): Node[] {
  const nodeInGroup = new Map<string, string>()
  const groupChildren = new Map<string, string[]>()

  for (const g of groupsArr) {
    for (const nid of g.nodeIds) {
      nodeInGroup.set(nid, g.id)
    }
    groupChildren.set(g.id, g.nodeIds.filter((nid) => nodesArr.some((n) => n.id === nid)))
  }

  const groupNodes: Node[] = groupsArr.map((g) => {
    const childIds = groupChildren.get(g.id) || []
    const childNodes = nodesArr.filter((n) => childIds.includes(n.id))
    let minX = 0, minY = 0, maxX = 200, maxY = 150
    if (childNodes.length > 0) {
      minX = Math.min(...childNodes.map((n) => n.position.x))
      minY = Math.min(...childNodes.map((n) => n.position.y))
      maxX = Math.max(...childNodes.map((n) => n.position.x + NODE_WIDTH))
      maxY = Math.max(...childNodes.map((n) => n.position.y + NODE_HEIGHT))
    }
    return {
      id: g.id,
      type: 'topology-group',
      position: { x: minX - GROUP_PADDING, y: minY - GROUP_PADDING },
      data: { label: g.name, color: g.color },
      style: {
        width: maxX - minX + GROUP_PADDING * 2,
        height: maxY - minY + GROUP_PADDING * 2,
      },
      draggable: true,
      zIndex: -1,
    }
  })

  const nodeItems: Node[] = nodesArr.map((n) => ({
    id: n.id,
    type: 'topology-node',
    position: n.position,
    data: { label: n.name, nodeData: n },
  }))

  return [...groupNodes, ...nodeItems]
}

export function CanvasArea() {
  const colors = useThemeColors()
  const nodes = useTopologyStore((s) => s.nodes)
  const groups = useTopologyStore((s) => s.groups)
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

  const rfNodes: Node[] = useMemo(() => buildAllRfNodes(nodes, groups), [nodes, groups])
  const rfEdges: Edge[] = useMemo(() => {
    return edgesList.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      type: 'topology-edge',
      data: { edgeData: e },
    })) as Edge[]
  }, [edgesList])

  const isGroupNode = useCallback((id: string) => {
    return groups.some((g) => g.id === id)
  }, [groups])

  const onNodesChange = useCallback((changes: NodeChange<Node>[]) => {
    const store = useTopologyStore.getState()
    const currentNodes = store.nodes
    const currentGroups = store.groups
    const currentRfNodes = currentNodes.map((n) => ({
      id: n.id,
      type: 'topology-node',
      position: n.position,
      data: { label: n.name, nodeData: n },
    })) as Node[]

    applyNodeChanges(changes, currentRfNodes)

    const positionUpdates = new Map<string, { x: number; y: number }>()
    const removeIds = new Set<string>()

    changes.forEach((ch) => {
      if (ch.type === 'position' && ch.position) {
        positionUpdates.set(ch.id, ch.position)
      }
      if (ch.type === 'remove') {
        removeIds.add(ch.id)
      }
    })

    if (removeIds.size > 0) {
      store.removeNodes([...removeIds])
    }

    if (positionUpdates.size > 0) {
      const groupDeltas: { groupId: string; dx: number; dy: number }[] = []

      currentGroups.forEach((g) => {
        const pos = positionUpdates.get(g.id)
        if (pos) {
          const oldGroupRf = buildAllRfNodes(currentNodes, currentGroups).find((n) => n.id === g.id)
          if (oldGroupRf) {
            groupDeltas.push({ groupId: g.id, dx: pos.x - oldGroupRf.position.x, dy: pos.y - oldGroupRf.position.y })
          }
        }
        positionUpdates.delete(g.id)
      })

      let updatedNodes = currentNodes.map((n) => {
        const pos = positionUpdates.get(n.id)
        return pos ? { ...n, position: pos } : n
      })

      for (const { groupId, dx, dy } of groupDeltas) {
        const group = currentGroups.find((g) => g.id === groupId)
        if (group) {
          updatedNodes = updatedNodes.map((n) => {
            if (group.nodeIds.includes(n.id)) {
              return { ...n, position: { x: n.position.x + dx, y: n.position.y + dy } }
            }
            return n
          })
        }
      }

      if (!nodesAreEqual(currentNodes, updatedNodes)) {
        setNodes(updatedNodes)
      }
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
      data: { edgeData: e },
    }))
    applyEdgeChanges(changes, currentRfEdges)

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
  }, [addEdge])

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    if (isGroupNode(node.id)) {
      closePanel()
      return
    }
    openNodePanel(node.id)
  }, [openNodePanel, closePanel, isGroupNode])

  const onEdgeClick: EdgeMouseHandler = useCallback((_event, edge) => {
    openEdgePanel(edge.id)
  }, [openEdgePanel])

  const onPaneClick = useCallback(() => {
    closePanel()
  }, [closePanel])

  const setSelectedNodeIds = useTopologyStore((s) => s.setSelectedNodeIds)
  const setSelectedEdgeIds = useTopologyStore((s) => s.setSelectedEdgeIds)

  const onSelectionChange = useCallback(({ nodes: selectedNodes, edges: selectedRfEdges }: { nodes: Node[]; edges: Edge[] }) => {
    setSelectedNodeIds(selectedNodes.filter((n) => !isGroupNode(n.id)).map((n) => n.id))
    setSelectedEdgeIds(selectedRfEdges.map((e) => e.id))
  }, [setSelectedNodeIds, setSelectedEdgeIds, isGroupNode])

  const onNodeDragStop: OnNodeDrag = useCallback((_event, node) => {
    moveNode(node.id, node.position)
  }, [moveNode])

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
        onSelectionChange={onSelectionChange}
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
          nodeColor="#4c9aff"
          maskColor="rgba(0,0,0,0.5)"
        />
      </ReactFlow>
    </div>
  )
}

function nodesAreEqual(a: TopologyNode[], b: TopologyNode[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i].position.x !== b[i].position.x || a[i].position.y !== b[i].position.y) return false
  }
  return true
}
