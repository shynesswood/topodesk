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
import type { Group } from '../../types'

const nodeTypes = {
  'topology-node': TopologyNodeComponent,
  'topology-group': GroupNodeComponent,
}
const edgeTypes = { 'topology-edge': TopologyEdgeComponent }

function buildAllRfNodes(nodesArr: { id: string; name: string; position: { x: number; y: number }; ip?: string; description?: string }[], groupsArr: Group[]): Node[] {
  const groupNodes: Node[] = groupsArr.map((g) => ({
    id: g.id,
    type: 'topology-group',
    position: { x: g.position?.x || 100, y: g.position?.y || 100 },
    data: { label: g.name, color: g.color },
    style: {
      width: g.width || 300,
      height: g.height || 200,
    },
    draggable: true,
  }))

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
  const moveGroupPosition = useTopologyStore((s) => s.moveGroupPosition)

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
      const groupRemoveIds = new Set<string>()
      removeIds.forEach((id) => {
        if (currentGroups.some((g) => g.id === id)) {
          groupRemoveIds.add(id)
          removeIds.delete(id)
        }
      })
      if (groupRemoveIds.size > 0) {
        groupRemoveIds.forEach((gid) => store.removeGroup(gid))
      }
      if (removeIds.size > 0) {
        store.removeNodes([...removeIds])
      }
    }

    if (positionUpdates.size > 0) {
      const groupDeltas: { groupId: string; dx: number; dy: number }[] = []

      currentGroups.forEach((g) => {
        const pos = positionUpdates.get(g.id)
        if (pos) {
          const oldPos = g.position || { x: 100, y: 100 }
          groupDeltas.push({ groupId: g.id, dx: pos.x - oldPos.x, dy: pos.y - oldPos.y })
          moveGroupPosition(g.id, pos)
        }
        positionUpdates.delete(g.id)
      })

      let updatedNodes = currentNodes.map((n) => {
        const pos = positionUpdates.get(n.id)
        return pos ? { ...n, position: pos } : n
      })

      for (const { groupId, dx, dy } of groupDeltas) {
        const group = currentGroups.find((g) => g.id === groupId)
        if (group && (dx !== 0 || dy !== 0)) {
          updatedNodes = updatedNodes.map((n) => {
            if (group.nodeIds.includes(n.id)) {
              return { ...n, position: { x: n.position.x + dx, y: n.position.y + dy } }
            }
            return n
          })
        }
      }

      if (updatedNodes.some((n, i) => n.position.x !== currentNodes[i]?.position.x || n.position.y !== currentNodes[i]?.position.y)) {
        setNodes(updatedNodes)
      }
    }
  }, [moveGroupPosition, setNodes])

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
    if (isGroupNode(node.id)) {
      moveGroupPosition(node.id, node.position)
    } else {
      moveNode(node.id, node.position)
    }
  }, [moveNode, moveGroupPosition, isGroupNode])

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
