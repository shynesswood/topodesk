import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useThemeColors } from '../../hooks/useThemeColors'
import { useTopologyStore } from '../../stores/topologyStore'

interface GroupNodeData {
  label: string
  color?: string
}

const HANDLE_SIZE = 8

export const GroupNodeComponent = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as unknown as GroupNodeData
  const colors = useThemeColors()
  const bgColor = nodeData.color || 'rgba(76, 154, 255, 0.08)'
  const resizeGroup = useTopologyStore((s) => s.resizeGroup)

  const [resizing, setResizing] = useState<string | null>(null)
  const [hovered, setHovered] = useState(false)
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number; startPosX: number; startPosY: number } | null>(null)
  const showResizeHandles = selected || hovered

  const handleResizeStart = useCallback((direction: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const store = useTopologyStore.getState()
    const group = store.groups.find((g) => g.id === id)
    if (!group) return

    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: group.width || 300,
      startH: group.height || 200,
      startPosX: group.position?.x || 100,
      startPosY: group.position?.y || 100,
    }
    setResizing(direction)
  }, [id])

  useEffect(() => {
    if (!resizing) return
    const direction = resizing

    function handleMouseMove(e: MouseEvent) {
      if (!resizeRef.current) return
      const r = resizeRef.current
      const dx = e.clientX - r.startX
      const dy = e.clientY - r.startY

      let newW = r.startW
      let newH = r.startH
      let newX = r.startPosX
      let newY = r.startPosY

      if (direction.includes('right')) { newW = Math.max(120, r.startW + dx) }
      if (direction.includes('left')) { newW = Math.max(120, r.startW - dx); newX = r.startPosX + dx }
      if (direction.includes('bottom')) { newH = Math.max(80, r.startH + dy) }
      if (direction.includes('top')) { newH = Math.max(80, r.startH - dy); newY = r.startPosY + dy }

      resizeGroup(id, newW, newH, { x: newX, y: newY })
    }

    function handleMouseUp() {
      setResizing(null)
      resizeRef.current = null

      const store = useTopologyStore.getState()
      const group = store.groups.find((g) => g.id === id)
      if (!group) return

      const nodeW = 180
      const nodeH = 80
      const gx = group.position?.x || 0
      const gy = group.position?.y || 0
      const gw = group.width || 300
      const gh = group.height || 200

      const toRemove: string[] = []
      for (const nid of group.nodeIds) {
        const node = store.nodes.find((n) => n.id === nid)
        if (!node) continue
        const cx = node.position.x + nodeW / 2
        const cy = node.position.y + nodeH / 2
        if (!(cx >= gx && cx <= gx + gw && cy >= gy && cy <= gy + gh)) {
          toRemove.push(nid)
        }
      }
      if (toRemove.length > 0) {
        store.removeNodesFromGroup(id, toRemove)
      }

      const toAdd: string[] = []
      for (const node of store.nodes) {
        if (group.nodeIds.includes(node.id)) continue
        const cx = node.position.x + nodeW / 2
        const cy = node.position.y + nodeH / 2
        if (cx >= gx && cx <= gx + gw && cy >= gy && cy <= gy + gh) {
          toAdd.push(node.id)
        }
      }
      if (toAdd.length > 0) {
        store.addNodesToGroup(id, toAdd)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizing, id, resizeGroup])

  const handleBase: React.CSSProperties = {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    background: '#58a6ff',
    border: '1px solid rgba(76, 154, 255, 0.8)',
    borderRadius: 2,
    zIndex: 20,
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: selected ? `${bgColor.replace('0.08)', '0.14)')}` : bgColor,
        border: `2px solid ${selected ? '#58a6ff' : 'rgba(76, 154, 255, 0.3)'}`,
        borderRadius: 8,
        position: 'relative',
        boxShadow: selected ? '0 0 12px rgba(88, 166, 255, 0.3)' : 'none',
        transition: 'box-shadow 0.15s, background 0.15s, border-color 0.15s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#58a6ff', visibility: showResizeHandles ? 'visible' : 'hidden' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#58a6ff', visibility: showResizeHandles ? 'visible' : 'hidden' }} />
      <Handle type="source" position={Position.Left} style={{ background: '#58a6ff', visibility: showResizeHandles ? 'visible' : 'hidden' }} />
      <Handle type="target" position={Position.Right} style={{ background: '#58a6ff', visibility: showResizeHandles ? 'visible' : 'hidden' }} />

      <div style={{
        position: 'absolute',
        top: -11,
        left: 12,
        background: colors.nodeBg,
        padding: '0 8px',
        fontSize: 11,
        fontWeight: 600,
        color: colors.textPrimary,
        borderRadius: 4,
        border: `1px solid ${selected ? '#58a6ff' : 'rgba(76, 154, 255, 0.3)'}`,
        whiteSpace: 'nowrap',
      }}>
        {nodeData.label}
      </div>

      {showResizeHandles && (
        <>
          <div className="nodrag" style={{ ...handleBase, top: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2, cursor: 'nwse-resize' }}
            onMouseDown={(e) => handleResizeStart('top-left', e)} />
          <div className="nodrag" style={{ ...handleBase, top: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2, cursor: 'nesw-resize' }}
            onMouseDown={(e) => handleResizeStart('top-right', e)} />
          <div className="nodrag" style={{ ...handleBase, bottom: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2, cursor: 'nesw-resize' }}
            onMouseDown={(e) => handleResizeStart('bottom-left', e)} />
          <div className="nodrag" style={{ ...handleBase, bottom: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2, cursor: 'nwse-resize' }}
            onMouseDown={(e) => handleResizeStart('bottom-right', e)} />
        </>
      )}
    </div>
  )
})

GroupNodeComponent.displayName = 'GroupNodeComponent'
