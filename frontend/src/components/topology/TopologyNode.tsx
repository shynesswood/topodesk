import { memo, useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useThemeColors } from '../../hooks/useThemeColors'

interface TopologyNodeData {
  label: string
  nodeData: Record<string, unknown>
}

interface SoftwareEntry {
  name: string
  props?: Record<string, string>
}

const NODE_COLOR = '#4c9aff'

const DISPLAY_PROPS = [
  { key: 'installPath', label: '安装路径' },
  { key: 'dataPath', label: '数据路径' },
  { key: 'logPath', label: '日志路径' },
  { key: 'startCommand', label: '启动命令' },
  { key: 'stopCommand', label: '停止命令' },
  { key: 'restartCommand', label: '重启命令' },
]

export const TopologyNodeComponent = memo((props: NodeProps) => {
  const { data, selected } = props
  const nodeData = data as unknown as TopologyNodeData
  const colors = useThemeColors()
  const [hovered, setHovered] = useState(false)
  const nodeRef = useRef<HTMLDivElement>(null)
  const detailPopupRef = useRef<HTMLDivElement>(null)
  const [hoverPos, setHoverPos] = useState<{ left: number; top: number } | null>(null)
  const [detailPos, setDetailPos] = useState<{ left: number; top: number } | null>(null)
  const [selectedSwIdx, setSelectedSwIdx] = useState<number | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const isSelected = !!selected
  const showHandles = isSelected || hovered

  const softwareList: SoftwareEntry[] = Array.isArray(nodeData.nodeData?.software)
    ? (nodeData.nodeData.software as SoftwareEntry[])
    : []

  const softwareNames: string[] = softwareList.map((s) => s.name).filter(Boolean)
  const showHoverPopover = hovered && !isSelected && softwareList.length > 0 && selectedSwIdx === null

  const ip = (nodeData.nodeData?.ip as string) || ''

  const computePos = useCallback(() => {
    if (!nodeRef.current) return null
    const rect = nodeRef.current.getBoundingClientRect()
    return { left: rect.right + 12, top: rect.top }
  }, [])

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

  return (
    <>
      <div
        ref={nodeRef}
        style={{
          background: colors.nodeBg,
          border: `2px solid ${isSelected ? '#58a6ff' : 'rgba(76, 154, 255, 0.3)'}`,
          borderRadius: 8,
          padding: '10px 16px',
          minWidth: 140,
          boxShadow: isSelected
            ? '0 0 16px rgba(88, 166, 255, 0.55), 0 0 4px rgba(88, 166, 255, 0.35)'
            : '0 2px 4px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          transition: 'box-shadow 0.15s, border-color 0.15s, outline 0.15s',
          outline: isSelected ? '2px solid rgba(88, 166, 255, 0.35)' : '1px solid transparent',
          outlineOffset: 2,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Handle type="target" position={Position.Top} style={{ background: NODE_COLOR, opacity: showHandles ? 1 : 0 }} />
        <Handle type="source" position={Position.Left} style={{ background: NODE_COLOR, opacity: showHandles ? 1 : 0 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{'\u{1F5A5}'}</span>
          <div>
            <div style={{ color: colors.textPrimary, fontSize: 13, fontWeight: 600 }}>
              {nodeData.label}
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
        <Handle type="source" position={Position.Bottom} style={{ background: NODE_COLOR, opacity: showHandles ? 1 : 0 }} />
        <Handle type="target" position={Position.Right} style={{ background: NODE_COLOR, opacity: showHandles ? 1 : 0 }} />
      </div>

      {showHoverPopover && hoverPos &&
        createPortal(
          <div
            className="nodrag"
            style={{
              position: 'fixed',
              left: hoverPos.left,
              top: hoverPos.top,
              minWidth: 220,
              maxWidth: 320,
              maxHeight: 400,
              overflow: 'auto',
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
            <div style={{ color: colors.textPrimary, fontWeight: 600, marginBottom: 4, fontSize: 12 }}>
              {nodeData.label}
            </div>
            {ip && (
              <div style={{ color: colors.textSecondary, marginBottom: 8, fontSize: 10 }}>
                {ip}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {softwareList.map((sw, i) => {
                const swProps = sw.props || {}
                const displayItems = DISPLAY_PROPS.filter(({ key }) => swProps[key])
                if (displayItems.length === 0) {
                  return (
                    <div key={i}>
                      <div style={{ color: '#58a6ff', fontWeight: 600, fontSize: 11, marginBottom: 2 }}>
                        {sw.name}
                      </div>
                      <div style={{ color: colors.textSecondary, fontSize: 10, fontStyle: 'italic' }}>
                        暂无详细信息
                      </div>
                    </div>
                  )
                }
                return (
                  <div key={i}>
                    <div style={{ color: '#58a6ff', fontWeight: 600, fontSize: 11, marginBottom: 2 }}>
                      {sw.name}
                    </div>
                    {displayItems.map(({ key, label }) => (
                      <div key={key} style={{ display: 'flex', gap: 6, fontSize: 10, lineHeight: '18px', marginLeft: 4 }}>
                        <span style={{ color: colors.textSecondary, minWidth: 32, flexShrink: 0 }}>{label}</span>
                        <span style={{ color: colors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {swProps[key]}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
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
