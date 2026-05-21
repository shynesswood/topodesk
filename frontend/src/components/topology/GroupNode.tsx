import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useThemeColors } from '../../hooks/useThemeColors'
import { useTopologyStore } from '../../stores/topologyStore'

interface GroupNodeData {
  label: string
  color?: string
}

const HANDLE_SIZE = 8

export const GroupNodeComponent = memo((props: NodeProps) => {
  const { id, data, selected } = props
  const nodeData = data as unknown as GroupNodeData
  const colors = useThemeColors()
  const rawColor = nodeData.color || 'rgba(76, 154, 255, 0.08)'
  const resizeGroup = useTopologyStore((s) => s.resizeGroup)

  const [resizing, setResizing] = useState<string | null>(null)
  const [hovered, setHovered] = useState(false)
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number; startPosX: number; startPosY: number } | null>(null)
  const isSelected = !!selected
  const showResizeHandles = isSelected || hovered

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
      let w = r.startW, h = r.startH, x = r.startPosX, y = r.startPosY
      if (direction.includes('right')) w = Math.max(120, r.startW + dx)
      if (direction.includes('left')) { w = Math.max(120, r.startW - dx); x = r.startPosX + dx }
      if (direction.includes('bottom')) h = Math.max(80, r.startH + dy)
      if (direction.includes('top')) { h = Math.max(80, r.startH - dy); y = r.startPosY + dy }
      resizeGroup(id, w, h, { x, y })
    }
    function handleMouseUp() {
      setResizing(null)
      resizeRef.current = null
      const store = useTopologyStore.getState()
      const group = store.groups.find((g) => g.id === id)
      if (!group) return
      const nw = 180, nh = 80
      const gx = group.position?.x || 0, gy = group.position?.y || 0
      const gw = group.width || 300, gh = group.height || 200
      const toRemove = group.nodeIds.filter((nid) => {
        const node = store.nodes.find((n) => n.id === nid)
        if (!node) return true
        return !(node.position.x + nw / 2 >= gx && node.position.x + nw / 2 <= gx + gw && node.position.y + nh / 2 >= gy && node.position.y + nh / 2 <= gy + gh)
      })
      if (toRemove.length) store.removeNodesFromGroup(id, toRemove)
      const toAdd = store.nodes.filter((n) => !group.nodeIds.includes(n.id) && n.position.x + nw / 2 >= gx && n.position.x + nw / 2 <= gx + gw && n.position.y + nh / 2 >= gy && n.position.y + nh / 2 <= gy + gh).map((n) => n.id)
      if (toAdd.length) store.addNodesToGroup(id, toAdd)
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizing, id, resizeGroup])

  const handleBase: React.CSSProperties = {
    position: 'absolute', width: HANDLE_SIZE, height: HANDLE_SIZE,
    background: '#58a6ff', border: '1px solid rgba(76, 154, 255, 0.8)',
    borderRadius: 2, zIndex: 20,
  }

  return (
    <div
      style={{
        width: '100%', height: '100%', borderRadius: 8, position: 'relative',
        background: isSelected ? rawColor.replace(/0\.08\)$/, '0.16)') : rawColor,
        border: `2px solid ${isSelected ? '#58a6ff' : 'rgba(76, 154, 255, 0.3)'}`,
        boxShadow: isSelected ? '0 0 16px rgba(88, 166, 255, 0.4)' : 'none',
        transition: 'box-shadow 0.15s, background 0.15s, border-color 0.15s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#58a6ff', opacity: showResizeHandles ? 1 : 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#58a6ff', opacity: showResizeHandles ? 1 : 0 }} />
      <Handle type="source" position={Position.Left} style={{ background: '#58a6ff', opacity: showResizeHandles ? 1 : 0 }} />
      <Handle type="target" position={Position.Right} style={{ background: '#58a6ff', opacity: showResizeHandles ? 1 : 0 }} />

      <div style={{
        position: 'absolute', top: -11, left: 12,
        background: colors.nodeBg, padding: '0 8px',
        fontSize: 11, fontWeight: 600, color: colors.textPrimary,
        borderRadius: 4, border: `1px solid ${isSelected ? '#58a6ff' : 'rgba(76, 154, 255, 0.3)'}`,
        whiteSpace: 'nowrap',
      }}>
        {nodeData.label}
      </div>

      {showResizeHandles && (
        <>
          <div className="nodrag" style={{ ...handleBase, top: -4, left: -4, cursor: 'nwse-resize' }} onMouseDown={(e) => handleResizeStart('top-left', e)} />
          <div className="nodrag" style={{ ...handleBase, top: -4, right: -4, cursor: 'nesw-resize' }} onMouseDown={(e) => handleResizeStart('top-right', e)} />
          <div className="nodrag" style={{ ...handleBase, bottom: -4, left: -4, cursor: 'nesw-resize' }} onMouseDown={(e) => handleResizeStart('bottom-left', e)} />
          <div className="nodrag" style={{ ...handleBase, bottom: -4, right: -4, cursor: 'nwse-resize' }} onMouseDown={(e) => handleResizeStart('bottom-right', e)} />
        </>
      )}
    </div>
  )
})

GroupNodeComponent.displayName = 'GroupNodeComponent'
