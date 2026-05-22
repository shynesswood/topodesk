import { createPortal } from 'react-dom'
import { useEffect, useRef } from 'react'
import { EditOutlined, CopyOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { useTopologyStore } from '../../stores/topologyStore'
import { useUIStore } from '../../stores/uiStore'
import { useThemeColors } from '../../hooks/useThemeColors'
import { executeLocalCommand } from '../../services/cmdexecService'
import { executeCommand as executeSSHCommand } from '../../services/sshService'
import type { CommandInfo } from '../../types'

interface ContextMenuProps {
  x: number
  y: number
  nodeId: string
  onClose: () => void
}

export function NodeContextMenu({ x, y, nodeId, onClose }: ContextMenuProps) {
  const nodes = useTopologyStore((s) => s.nodes)
  const removeNode = useTopologyStore((s) => s.removeNode)
  const duplicateNode = useTopologyStore((s) => s.duplicateNode)
  const openNodePanel = useUIStore((s) => s.openNodePanel)
  const addTerminalEntry = useUIStore((s) => s.addTerminalEntry)
  const colors = useThemeColors()
  const menuRef = useRef<HTMLDivElement>(null)

  const node = nodes.find((n) => n.id === nodeId)
  if (!node) return null

  const commands: CommandInfo[] = node.commands || []
  const nodeIp = node.ip || ''
  const nodeSsh = node.ssh

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  async function handleRunCommand(cmd: CommandInfo) {
    onClose()
    const execType = cmd.type || 'local'

    addTerminalEntry({
      commandName: cmd.name,
      commandText: cmd.command,
      execType,
      targetIp: execType === 'ssh' ? nodeIp : undefined,
      stdout: '',
      stderr: '',
      exitCode: -1,
    })

    try {
      let result
      if (execType === 'ssh') {
        if (!nodeSsh?.username) {
          addTerminalEntry({
            commandName: cmd.name,
            commandText: cmd.command,
            execType,
            targetIp: nodeIp,
            stdout: '',
            stderr: '',
            exitCode: -1,
            error: '未配置 SSH 认证信息',
          })
          return
        }
        result = await executeSSHCommand(
          nodeIp, nodeSsh.port || 22, nodeSsh.username || '',
          nodeSsh.password || '', nodeSsh.privateKey || '', cmd.command
        )
      } else {
        result = await executeLocalCommand(cmd.command)
      }

      addTerminalEntry({
        commandName: cmd.name,
        commandText: cmd.command,
        execType,
        targetIp: execType === 'ssh' ? nodeIp : undefined,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        error: result.error,
      })
    } catch (err) {
      addTerminalEntry({
        commandName: cmd.name,
        commandText: cmd.command,
        execType,
        targetIp: execType === 'ssh' ? nodeIp : undefined,
        stdout: '',
        stderr: '',
        exitCode: -1,
        error: err instanceof Error ? err.message : '执行失败',
      })
    }
  }

  function handleEdit() {
    onClose()
    openNodePanel(nodeId)
  }

  function handleDuplicate() {
    onClose()
    duplicateNode(nodeId)
  }

  function handleDelete() {
    onClose()
    removeNode(nodeId)
  }

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    left: x,
    top: y,
    minWidth: 180,
    background: colors.nodeBg,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    padding: '4px 0',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    zIndex: 10000,
    fontSize: 12,
  }

  const itemStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 12px', cursor: 'pointer', color: colors.textPrimary,
  }

  const dividerStyle: React.CSSProperties = {
    height: 1, background: colors.border, margin: '4px 0',
  }

  return createPortal(
    <div ref={menuRef} style={menuStyle}>
      {commands.length > 0 && (
        <>
          <div style={{ padding: '4px 12px', fontSize: 10, color: colors.textSecondary, fontWeight: 600, textTransform: 'uppercase' }}>
            执行命令
          </div>
          {commands.map((cmd, i) => (
            <div
              key={i}
              onClick={() => handleRunCommand(cmd)}
              style={{
                ...itemStyle,
                background: 'transparent',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = colors.bgSecondary }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
            >
              <PlayCircleOutlined style={{ color: '#52c41a', fontSize: 12 }} />
              <span style={{ flex: 1 }}>{cmd.name}</span>
              <span style={{
                fontSize: 9, padding: '1px 4px', borderRadius: 2,
                background: cmd.type === 'ssh' ? 'rgba(82, 196, 26, 0.15)' : 'rgba(250, 173, 20, 0.15)',
                color: cmd.type === 'ssh' ? '#52c41a' : '#faad14',
              }}>
                {cmd.type === 'ssh' ? 'SSH' : '本地'}
              </span>
            </div>
          ))}
          <div style={dividerStyle} />
        </>
      )}
      <div onClick={handleEdit} style={itemStyle}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = colors.bgSecondary }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
      >
        <EditOutlined style={{ fontSize: 12 }} /> 编辑节点
      </div>
      <div onClick={handleDuplicate} style={itemStyle}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = colors.bgSecondary }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
      >
        <CopyOutlined style={{ fontSize: 12 }} /> 复制节点
      </div>
      <div style={dividerStyle} />
      <div onClick={handleDelete} style={{ ...itemStyle, color: '#ff4d4f' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255, 77, 79, 0.1)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
      >
        <DeleteOutlined style={{ fontSize: 12 }} /> 删除节点
      </div>
    </div>,
    document.body,
  )
}
