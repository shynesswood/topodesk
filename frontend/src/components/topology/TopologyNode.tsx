import { memo, useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useThemeColors } from '../../hooks/useThemeColors'
import { useTopologyStore } from '../../stores/topologyStore'

interface TopologyNodeData {
  label: string
  nodeData: Record<string, unknown>
}

interface SoftwareEntry {
  name: string
  props?: Record<string, string>
}

const NODE_COLOR = '#4c9aff'
const HANDLE_SIZE = 8

const DISPLAY_PROPS = [
  { key: 'installPath', label: '安装路径' },
  { key: 'dataPath', label: '数据路径' },
  { key: 'logPath', label: '日志路径' },
  { key: 'startCommand', label: '启动命令' },
  { key: 'stopCommand', label: '停止命令' },
  { key: 'restartCommand', label: '重启命令' },
]

export const TopologyNodeComponent = memo((props: NodeProps) => {
  const { id, data, selected } = props
  const nodeData = data as unknown as TopologyNodeData
  const colors = useThemeColors()
  const resizeNode = useTopologyStore((s) => s.resizeNode)
  const [hovered, setHovered] = useState(false)
  const [resizing, setResizing] = useState<string | null>(null)
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number; startPosX: number; startPosY: number } | null>(null)
  const nodeRef = useRef<HTMLDivElement>(null)
  const detailPopupRef = useRef<HTMLDivElement>(null)
  const [hoverPos, setHoverPos] = useState<{ left: number; top: number } | null>(null)
  const [detailPos, setDetailPos] = useState<{ left: number; top: number } | null>(null)
  const [selectedSwIdx, setSelectedSwIdx] = useState<number | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const isSelected = !!selected
  const showHandles = isSelected || hovered || resizing !== null

  const softwareList: SoftwareEntry[] = Array.isArray(nodeData.nodeData?.software)
    ? (nodeData.nodeData.software as SoftwareEntry[])
    : []

  const softwareNames: string[] = softwareList.map((s) => s.name).filter(Boolean)
  const showHoverPopover = hovered && !isSelected && selectedSwIdx === null

  const ip = (nodeData.nodeData?.ip as string) || ''

  const description = (nodeData.nodeData?.description as string) || ''

  const osType = (nodeData.nodeData?.os as string) || 'linux'
  const osBadge = osType === 'windows'
    ? { label: 'Win', bg: 'rgba(0, 120, 212, 0.15)', color: '#0078d4' }
    : { label: 'Linux', bg: 'rgba(255, 165, 0, 0.15)', color: '#ffa500' }

  const ServerIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  )

  const computePos = useCallback(() => {
    if (!nodeRef.current) return null
    const rect = nodeRef.current.getBoundingClientRect()
    return { left: rect.right + 12, top: rect.top }
  }, [])

  const handleResizeStart = useCallback((direction: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const rect = nodeRef.current?.getBoundingClientRect()
    if (!rect) return
    const store = useTopologyStore.getState()
    const node = store.nodes.find((n) => n.id === id)
    if (!node) return
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: node.width || rect.width,
      startH: node.height || rect.height,
      startPosX: node.position.x,
      startPosY: node.position.y,
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
      if (direction.includes('right')) w = Math.max(140, r.startW + dx)
      if (direction.includes('left')) { w = Math.max(140, r.startW - dx); x = r.startPosX + dx }
      if (direction.includes('bottom')) h = Math.max(46, r.startH + dy)
      if (direction.includes('top')) { h = Math.max(46, r.startH - dy); y = r.startPosY + dy }
      resizeNode(id, w, h, { x, y })
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
  }, [resizing, id, resizeNode])

  useEffect(() => {
    if (showHoverPopover) {
      setHoverPos(computePos())
      window.addEventListener('scroll', computePos, true)
      return () => window.removeEventListener('scroll', computePos, true)
    }
    setHoverPos(null)
  }, [showHoverPopover, computePos])

  function handleBadgeClick(e: React.MouseEvent, idx: number) {
    e.stopPropagation()
    if (selectedSwIdx === idx) {
      setSelectedSwIdx(null)
      setDetailPos(null)
      return
    }
    setSelectedSwIdx(idx)
    setDetailPos(computePos())
  }

  async function handleCopy(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 1200)
    } catch {}
  }

  function closeDetail() {
    setSelectedSwIdx(null)
    setDetailPos(null)
  }

  useEffect(() => {
    if (selectedSwIdx === null) return
    const timer = setTimeout(() => {
      function handleClickOutside(e: MouseEvent) {
        if (detailPopupRef.current && !detailPopupRef.current.contains(e.target as Node)) {
          setSelectedSwIdx(null)
          setDetailPos(null)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, 0)
    return () => clearTimeout(timer)
  }, [selectedSwIdx])

  const selectedSw = selectedSwIdx !== null ? softwareList[selectedSwIdx] : null

  const nodeWidth = (nodeData.nodeData?.width as number) || undefined
  const nodeHeight = (nodeData.nodeData?.height as number) || undefined

  const handleBase: React.CSSProperties = {
    position: 'absolute', width: HANDLE_SIZE, height: HANDLE_SIZE,
    background: '#58a6ff', border: '1px solid rgba(76, 154, 255, 0.8)',
    borderRadius: 2, zIndex: 20,
  }

  return (
    <>
      <div
        ref={nodeRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: colors.nodeBg,
          border: `2px solid ${isSelected ? '#58a6ff' : 'rgba(76, 154, 255, 0.3)'}`,
          borderRadius: 8,
          width: nodeWidth,
          height: nodeHeight,
          minWidth: 140,
          boxShadow: isSelected
            ? '0 0 16px rgba(88, 166, 255, 0.55), 0 0 4px rgba(88, 166, 255, 0.35)'
            : '0 2px 4px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          transition: 'box-shadow 0.15s, border-color 0.15s, outline 0.15s',
          outline: isSelected ? '2px solid rgba(88, 166, 255, 0.35)' : '1px solid transparent',
          outlineOffset: 2,
          position: 'relative',
        }}
      >
        <Handle id="top" type="source" position={Position.Top} style={{ background: NODE_COLOR, opacity: showHandles ? 1 : 0 }} />
        <Handle id="left" type="source" position={Position.Left} style={{ background: NODE_COLOR, opacity: showHandles ? 1 : 0 }} />
        <div style={{
          padding: '10px 16px',
          overflow: (nodeWidth && nodeHeight) ? 'hidden' : 'visible',
          borderRadius: 6,
          height: nodeHeight ? '100%' : undefined,
          boxSizing: 'border-box',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <ServerIcon />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: colors.textPrimary, fontSize: 13, fontWeight: 600 }}>
                {nodeData.label}
              </span>
              <span style={{
                fontSize: 9, padding: '1px 5px', borderRadius: 3, lineHeight: '14px',
                background: osBadge.bg, color: osBadge.color, fontWeight: 600,
              }}>
                {osBadge.label}
              </span>
            </div>
            <div style={{ color: colors.textSecondary, fontSize: 10, marginTop: 2 }}>
              {ip}
            </div>
            {softwareNames.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 4 }}>
                {softwareNames.map((name, i) => (
                  <span
                    key={i}
                    onClick={(e) => handleBadgeClick(e, i)}
                    style={{
                      background: selectedSwIdx === i ? '#58a6ff' : 'rgba(76, 154, 255, 0.15)',
                      color: selectedSwIdx === i ? '#fff' : '#58a6ff',
                      fontSize: 9,
                      padding: '1px 6px',
                      borderRadius: 3,
                      lineHeight: '16px',
                      cursor: 'pointer',
                      transition: 'background 0.12s, color 0.12s',
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        </div>
        <Handle id="bottom" type="source" position={Position.Bottom} style={{ background: NODE_COLOR, opacity: showHandles ? 1 : 0 }} />
        <Handle id="right" type="source" position={Position.Right} style={{ background: NODE_COLOR, opacity: showHandles ? 1 : 0 }} />

        {showHandles && (
          <>
            <div className="nodrag" style={{ ...handleBase, top: -4, left: -4, cursor: 'nwse-resize' }} onMouseDown={(e) => handleResizeStart('top-left', e)} />
            <div className="nodrag" style={{ ...handleBase, top: -4, right: -4, cursor: 'nesw-resize' }} onMouseDown={(e) => handleResizeStart('top-right', e)} />
            <div className="nodrag" style={{ ...handleBase, bottom: -4, left: -4, cursor: 'nesw-resize' }} onMouseDown={(e) => handleResizeStart('bottom-left', e)} />
            <div className="nodrag" style={{ ...handleBase, bottom: -4, right: -4, cursor: 'nwse-resize' }} onMouseDown={(e) => handleResizeStart('bottom-right', e)} />
          </>
        )}
      </div>

      {showHoverPopover && hoverPos &&
        createPortal(
          <div
            className="nodrag"
            style={{
              position: 'fixed',
              left: hoverPos.left,
              top: hoverPos.top,
              minWidth: 200,
              maxWidth: 300,
              background: colors.nodeBg,
              border: '1px solid rgba(76, 154, 255, 0.3)',
              borderRadius: 8,
              padding: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              zIndex: 1000,
              fontSize: 11,
              pointerEvents: 'none',
            }}
          >
            <div style={{ color: colors.textPrimary, fontWeight: 600, marginBottom: 6, fontSize: 12 }}>
              {nodeData.label}
            </div>
            <div style={{ color: colors.textSecondary, marginBottom: 4, fontSize: 10 }}>
              {osType === 'windows' ? 'Windows' : 'Linux'}
            </div>
            {ip && (
              <div style={{ color: colors.textSecondary, marginBottom: 4, fontSize: 10 }}>
                IP: {ip}
              </div>
            )}
            {description && (
              <div style={{ color: colors.textSecondary, fontSize: 10, lineHeight: '16px' }}>
                {description}
              </div>
            )}
          </div>,
          document.body,
        )}

      {selectedSw !== null && detailPos &&
        createPortal(
          <div
            ref={detailPopupRef}
            className="nodrag"
            style={{
              position: 'fixed',
              left: detailPos.left,
              top: detailPos.top,
              width: 340,
              maxHeight: 420,
              overflow: 'auto',
              background: colors.nodeBg,
              border: '1px solid #58a6ff',
              borderRadius: 10,
              padding: 0,
              boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
              zIndex: 1100,
              fontSize: 11,
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 14px',
              borderBottom: '1px solid rgba(76, 154, 255, 0.2)',
            }}>
              <span style={{ color: '#58a6ff', fontWeight: 700, fontSize: 13 }}>
                {selectedSw.name}
              </span>
              <span onClick={closeDetail} style={{ color: colors.textSecondary, cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: '0 2px' }}>
                ✕
              </span>
            </div>
            <div style={{ padding: '10px 14px 14px' }}>
              {(() => {
                const swProps = selectedSw.props || {}
                const standardItems = DISPLAY_PROPS.filter(({ key }) => swProps[key])
                const knownKeys = new Set(DISPLAY_PROPS.map((p) => p.key))
                const customKeys = Object.keys(swProps).filter((k) => !knownKeys.has(k))

                if (standardItems.length === 0 && customKeys.length === 0) {
                  return (
                    <div style={{ color: colors.textSecondary, fontSize: 11, fontStyle: 'italic', textAlign: 'center', padding: 12 }}>
                      暂无详细信息
                    </div>
                  )
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {standardItems.map(({ key, label }) => (
                      <RowValue
                        key={key}
                        label={label}
                        value={swProps[key]}
                        copied={copiedKey === key}
                        onCopy={() => handleCopy(swProps[key], key)}
                      />
                    ))}
                    {customKeys.length > 0 && standardItems.length > 0 && (
                      <div style={{ borderTop: '1px solid rgba(76, 154, 255, 0.1)', margin: '2px 0' }} />
                    )}
                    {customKeys.map((key) => (
                      <RowValue
                        key={key}
                        label={key}
                        value={swProps[key]}
                        copied={copiedKey === key}
                        onCopy={() => handleCopy(swProps[key], key)}
                      />
                    ))}
                  </div>
                )
              })()}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
})

function RowValue({ label, value, copied, onCopy }: {
  label: string
  value: string
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div
      onClick={onCopy}
      style={{
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        borderRadius: 4,
        padding: '4px 6px',
        transition: 'background 0.1s',
        background: copied ? 'rgba(76, 154, 255, 0.15)' : 'transparent',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(76, 154, 255, 0.08)' }}
      onMouseLeave={(e) => { if (!copied) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
    >
      <span style={{ color: '#8b949e', width: 64, flexShrink: 0, fontSize: 10 }}>
        {label}
      </span>
      <span style={{
        color: '#e6edf3',
        fontSize: 11,
        fontFamily: 'SFMono-Regular, Consolas, monospace',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        flex: 1,
      }}>
        {value}
      </span>
      <span style={{
        color: copied ? '#58a6ff' : 'transparent',
        fontSize: 9,
        flexShrink: 0,
        width: 32,
        textAlign: 'right',
      }}>
        {copied ? '已复制' : '复制'}
      </span>
    </div>
  )
}

TopologyNodeComponent.displayName = 'TopologyNodeComponent'
