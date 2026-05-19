import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useThemeColors } from '../../hooks/useThemeColors'
import { useTopologyStore } from '../../stores/topologyStore'

interface GroupNodeData {
  label: string
  color?: string
}

const HANDLE_SIZE = 10

export const GroupNodeComponent = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as unknown as GroupNodeData
  const colors = useThemeColors()
  const bgColor = nodeData.color || 'rgba(76, 154, 255, 0.08)'
  const resizeGroup = useTopologyStore((s) => s.resizeGroup)

  const [resizing, setResizing] = useState<string | null>(null)
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number; startPosX: number; startPosY: number } | null>(null)

  const handleResizeStart = useCallback((corner: string, e: React.MouseEvent) => {
    e.stopPropagation()
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
    setResizing(corner)
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

      if (direction.includes('right')) newW = Math.max(100, r.startW + dx)
      if (direction.includes('left')) { newW = Math.max(100, r.startW - dx); newX = r.startPosX + dx }
      if (direction.includes('bottom')) newH = Math.max(80, r.startH + dy)
      if (direction.includes('top')) { newH = Math.max(80, r.startH - dy); newY = r.startPosY + dy }

      resizeGroup(id, newW, newH, { x: newX, y: newY })
    }

    function handleMouseUp() {
      setResizing(null)
      resizeRef.current = null
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizing, id, resizeGroup])

  const handleStyle: React.CSSProperties = {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    background: selected ? '#58a6ff' : 'rgba(76, 154, 255, 0.4)',
    border: '1px solid rgba(76, 154, 255, 0.6)',
    borderRadius: 2,
    cursor: 'nwse-resize',
    zIndex: 10,
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: bgColor,
      border: `2px solid ${selected ? '#58a6ff' : 'rgba(76, 154, 255, 0.3)'}`,
      borderRadius: 8,
      position: 'relative',
    }}>
      <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
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
        border: `1px solid rgba(76, 154, 255, 0.3)`,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
      }}>
        {nodeData.label}
      </div>

      {selected && (
        <>
          <div style={{ ...handleStyle, top: -5, left: -5, cursor: 'nwse-resize' }}
            onMouseDown={(e) => handleResizeStart('top-left', e)} />
          <div style={{ ...handleStyle, top: -5, right: -5, cursor: 'nesw-resize' }}
            onMouseDown={(e) => handleResizeStart('top-right', e)} />
          <div style={{ ...handleStyle, bottom: -5, left: -5, cursor: 'nesw-resize' }}
            onMouseDown={(e) => handleResizeStart('bottom-left', e)} />
          <div style={{ ...handleStyle, bottom: -5, right: -5, cursor: 'nwse-resize' }}
            onMouseDown={(e) => handleResizeStart('bottom-right', e)} />
        </>
      )}

      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
    </div>
  )
})

GroupNodeComponent.displayName = 'GroupNodeComponent'
