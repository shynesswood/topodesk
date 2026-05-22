import { useRef, useState } from 'react'
import { DeleteOutlined, CopyOutlined, DownOutlined, UpOutlined } from '@ant-design/icons'
import { useUIStore } from '../../stores/uiStore'
import { useThemeColors } from '../../hooks/useThemeColors'

export function TerminalBar() {
  const terminalBar = useUIStore((s) => s.terminalBar)
  const hideTerminalBar = useUIStore((s) => s.hideTerminalBar)
  const clearTerminalEntries = useUIStore((s) => s.clearTerminalEntries)
  const setTerminalHeight = useUIStore((s) => s.setTerminalHeight)
  const setActiveTerminalIndex = useUIStore((s) => s.setActiveTerminalIndex)
  const colors = useThemeColors()

  const barRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)
  const startY = useRef(0)
  const startHeight = useRef(0)

  const activeEntry = terminalBar.activeIndex >= 0 ? terminalBar.entries[terminalBar.activeIndex] : null

  function handleResizeStart(e: React.MouseEvent) {
    e.preventDefault()
    setIsResizing(true)
    startY.current = e.clientY
    startHeight.current = terminalBar.height
    document.addEventListener('mousemove', handleResizeMove)
    document.addEventListener('mouseup', handleResizeEnd)
  }

  function handleResizeMove(e: MouseEvent) {
    const delta = startY.current - e.clientY
    const newHeight = Math.max(100, Math.min(500, startHeight.current + delta))
    setTerminalHeight(newHeight)
  }

  function handleResizeEnd() {
    setIsResizing(false)
    document.removeEventListener('mousemove', handleResizeMove)
    document.removeEventListener('mouseup', handleResizeEnd)
  }

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {}
  }

  if (!terminalBar.visible) return null

  return (
    <div
      ref={barRef}
      style={{
        height: terminalBar.height,
        background: colors.bgSecondary,
        borderTop: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <div
        onMouseDown={handleResizeStart}
        style={{
          height: 4,
          cursor: isResizing ? 'ns-resize' : 'row-resize',
          background: isResizing ? '#58a6ff' : 'transparent',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      />

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 12px', borderBottom: `1px solid ${colors.border}`,
        background: colors.bgPrimary,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: colors.textPrimary }}>终端</span>
          {terminalBar.entries.length > 1 && (
            <div style={{ display: 'flex', gap: 2 }}>
              {terminalBar.entries.map((entry, i) => (
                <button
                  key={entry.id}
                  onClick={() => setActiveTerminalIndex(i)}
                  style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 3, border: 'none',
                    background: i === terminalBar.activeIndex ? '#58a6ff' : colors.bgSecondary,
                    color: i === terminalBar.activeIndex ? '#fff' : colors.textSecondary,
                    cursor: 'pointer', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                  title={entry.commandName}
                >
                  {entry.commandName}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => hideTerminalBar()} style={{
            background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', padding: '2px 6px', fontSize: 12,
          }}>
            <DownOutlined />
          </button>
          <button onClick={clearTerminalEntries} style={{
            background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', padding: '2px 6px', fontSize: 12,
          }}>
            <DeleteOutlined />
          </button>
        </div>
      </div>

      {activeEntry && (
        <div style={{ flex: 1, overflow: 'auto', padding: 8, fontFamily: 'SFMono-Regular, Consolas, monospace', fontSize: 11 }}>
          <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#58a6ff', fontWeight: 600 }}>{activeEntry.commandName}</span>
            <span style={{
              fontSize: 9, padding: '1px 6px', borderRadius: 3,
              background: activeEntry.execType === 'ssh' ? 'rgba(82, 196, 26, 0.15)' : 'rgba(250, 173, 20, 0.15)',
              color: activeEntry.execType === 'ssh' ? '#52c41a' : '#faad14',
            }}>
              {activeEntry.execType === 'ssh' ? 'SSH' : '本地'}
            </span>
            {activeEntry.targetIp && (
              <span style={{ color: colors.textSecondary, fontSize: 10 }}>{activeEntry.targetIp}</span>
            )}
            <span style={{ color: activeEntry.exitCode === 0 ? '#52c41a' : '#ff4d4f', fontSize: 10 }}>
              退出码: {activeEntry.exitCode}
            </span>
            <button onClick={() => handleCopy(activeEntry.commandText)} style={{
              background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', fontSize: 10, padding: '0 4px',
            }}>
              <CopyOutlined /> 复制命令
            </button>
          </div>
          {activeEntry.stdout && (
            <pre style={{
              margin: 0, color: colors.textPrimary, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
              background: colors.bgPrimary, padding: 8, borderRadius: 4,
            }}>{activeEntry.stdout}</pre>
          )}
          {activeEntry.stderr && (
            <pre style={{
              margin: '6px 0 0', color: '#ff4d4f', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
              background: 'rgba(255, 77, 79, 0.05)', padding: 8, borderRadius: 4,
            }}>{activeEntry.stderr}</pre>
          )}
          {activeEntry.error && (
            <div style={{ marginTop: 6, color: '#ff4d4f', fontSize: 11 }}>{activeEntry.error}</div>
          )}
          {!activeEntry.stdout && !activeEntry.stderr && !activeEntry.error && (
            <div style={{ color: colors.textSecondary, fontStyle: 'italic' }}>无输出</div>
          )}
        </div>
      )}
    </div>
  )
}
