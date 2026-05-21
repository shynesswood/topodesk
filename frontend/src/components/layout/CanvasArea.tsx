import { useCallback, useMemo, useEffect } from 'react'
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

function buildAllRfNodes(nodesArr: { id: string; name: string; position: { x: number; y: number }; ip?: string; description?: string }[], groupsArr: Group[], selectedNodeIds: string[]): Node[] {
  const selectedSet = new Set(selectedNodeIds)
  const groupNodes: Node[] = groupsArr.map((g) => ({
    id: g.id,
    type: 'topology-group',
    position: { x: g.position?.x || 100, y: g.position?.y || 100 },
    data: { label: g.name, color: g.color },
    style: {
      width: g.width || 300,
      height: g.height || 200,
    },
    selected: selectedSet.has(g.id),
    draggable: true,
  }))

  const nodeItems: Node[] = nodesArr.map((n) => ({
    id: n.id,
    type: 'topology-node',
    position: n.position,
    data: { label: n.name, nodeData: n },
    selected: selectedSet.has(n.id),
  }))

  return [...groupNodes, ...nodeItems]
}

export function CanvasArea() {
  const colors = useThemeColors()
  const nodes = useTopologyStore((s) => s.nodes)
  const groups = useTopologyStore((s) => s.groups)
  const edgesList = useTopologyStore((s) => s.edges)
  const selectedNodeIds = useTopologyStore((s) => s.selectedNodeIds)
  const selectedEdgeIds = useTopologyStore((s) => s.selectedEdgeIds)
  const viewport = useTopologyStore((s) => s.viewport)
  const setNodes = useTopologyStore((s) => s.setNodes)
  const setEdges = useTopologyStore((s) => s.setEdges)
  const addEdge = useTopologyStore((s) => s.addEdge)
  const moveNode = useTopologyStore((s) => s.moveNode)
  const moveGroupPosition = useTopologyStore((s) => s.moveGroupPosition)
  const addNodesToGroup = useTopologyStore((s) => s.addNodesToGroup)
  const removeNodesFromGroup = useTopologyStore((s) => s.removeNodesFromGroup)
  const setSelectedNodeIds = useTopologyStore((s) => s.setSelectedNodeIds)
  const setSelectedEdgeIds = useTopologyStore((s) => s.setSelectedEdgeIds)

  const openNodePanel = useUIStore((s) => s.openNodePanel)
  const openEdgePanel = useUIStore((s) => s.openEdgePanel)
  const openGroupPanel = useUIStore((s) => s.openGroupPanel)
  const closePanel = useUIStore((s) => s.closePanel)

  const rfNodes: Node[] = useMemo(() => buildAllRfNodes(nodes, groups, selectedNodeIds), [nodes, groups, selectedNodeIds])
  const rfEdges: Edge[] = useMemo(() => {
    const selectedSet = new Set(selectedEdgeIds)
    return edgesList.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      type: 'topology-edge',
      selected: selectedSet.has(e.id),
      data: { edgeData: e },
    })) as Edge[]
  }, [edgesList, selectedEdgeIds])

  const isGroupNode = useCallback((id: string) => {
    return groups.some((g) => g.id === id)
  }, [groups])

  const onNodesChange = useCallback((changes: NodeChange<Node>[]) => {
    const store = useTopologyStore.getState()
    const currentNodes = store.nodes
    const currentGroups = store.groups

    const positionUpdates = new Map<string, { x: number; y: number }>()

    changes.forEach((ch) => {
      if (ch.type === 'position' && ch.position) {
        positionUpdates.set(ch.id, ch.position)
      }
      if (ch.type === 'select') {
        if (ch.selected) {
          store.setSelectedNodeIds([...store.selectedNodeIds, ch.id])
        } else {
          store.setSelectedNodeIds(store.selectedNodeIds.filter((id) => id !== ch.id))
        }
      }
    })

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

  const onEdgesChange = useCallback((_changes: EdgeChange<Edge>[]) => {
    // Edge remove is handled by the Delete key listener
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
    setSelectedEdgeIds([])
    if (isGroupNode(node.id)) {
      openGroupPanel(node.id)
      return
    }
    openNodePanel(node.id)
  }, [openNodePanel, openGroupPanel, isGroupNode, setSelectedEdgeIds])

  const onEdgeClick: EdgeMouseHandler = useCallback((_event, edge) => {
    setSelectedNodeIds([])
    setSelectedEdgeIds([edge.id])
    openEdgePanel(edge.id)
  }, [openEdgePanel, setSelectedNodeIds, setSelectedEdgeIds])

  const onPaneClick = useCallback(() => {
    setSelectedNodeIds([])
    setSelectedEdgeIds([])
    closePanel()
  }, [closePanel, setSelectedNodeIds, setSelectedEdgeIds])

  const onSelectionChange = useCallback(({ nodes: selectedNodes, edges: selectedRfEdges }: { nodes: Node[]; edges: Edge[] }) => {
    setSelectedNodeIds(selectedNodes.map((n) => n.id))
    setSelectedEdgeIds(selectedRfEdges.map((e) => e.id))
  }, [setSelectedNodeIds, setSelectedEdgeIds])

  const onNodeDragStop: OnNodeDrag = useCallback((_event, node) => {
    if (isGroupNode(node.id)) {
      moveGroupPosition(node.id, node.position)
      return
    }

    moveNode(node.id, node.position)

    const store = useTopologyStore.getState()
    const currentGroups = store.groups

    if (currentGroups.length === 0) return

    const nodeW = 180
    const nodeH = 80
    const cx = node.position.x + nodeW / 2
    const cy = node.position.y + nodeH / 2

    const groupsToJoin: string[] = []
    const groupsToLeave: string[] = []

    for (const g of currentGroups) {
      const gx = g.position?.x || 0
      const gy = g.position?.y || 0
      const gw = g.width || 300
      const gh = g.height || 200

      const inside = cx >= gx && cx <= gx + gw && cy >= gy && cy <= gy + gh
      const isMember = g.nodeIds.includes(node.id)

      if (inside && !isMember) {
        groupsToJoin.push(g.id)
      } else if (!inside && isMember) {
        groupsToLeave.push(g.id)
      }
    }

    for (const gid of groupsToJoin) addNodesToGroup(gid, [node.id])
    for (const gid of groupsToLeave) removeNodesFromGroup(gid, [node.id])
  }, [moveNode, moveGroupPosition, isGroupNode, addNodesToGroup, removeNodesFromGroup])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return

      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return

      const store = useTopologyStore.getState()
      const { selectedNodeIds, selectedEdgeIds, removeNodes, removeEdges, removeGroup, groups } = store

      if (selectedNodeIds.length > 0) {
        const groupIds = selectedNodeIds.filter((id) => groups.some((g) => g.id === id))
        const nodeIds = selectedNodeIds.filter((id) => !groups.some((g) => g.id === id))

        groupIds.forEach((gid) => removeGroup(gid))
        if (nodeIds.length > 0) removeNodes(nodeIds)

        useUIStore.getState().closePanel()
        return
      }

      if (selectedEdgeIds.length > 0) {
        removeEdges(selectedEdgeIds)
        useUIStore.getState().closePanel()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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
