import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { TopologyNode } from '../../types'
import { useThemeColors } from '../../hooks/useThemeColors'

interface TopologyNodeData {
  label: string
  nodeType: string
  nodeData: TopologyNode
}

const NODE_COLORS: Record<string, string> = {
  'Server': '#4c9aff',
  'Database': '#f5a623',
  'Redis': '#dc3545',
  'MQ': '#6f42c1',
  'Gateway': '#28a745',
  'API': '#17a2b8',
  'External Service': '#6c757d',
}

const NODE_ICONS: Record<string, string> = {
  'Server': '\u{1F5A5}',
  'Database': '\u{1F4BE}',
  'Redis': '\u{26A1}',
  'MQ': '\u{1F4E8}',
  'Gateway': '\u{1F310}',
  'API': '\u{1F517}',
  'External Service': '\u{2601}',
}

export const TopologyNodeComponent = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as TopologyNodeData
  const colors = useThemeColors()
  const color = NODE_COLORS[nodeData.nodeType] || '#6c757d'
  const icon = NODE_ICONS[nodeData.nodeType] || '\u{1F4E6}'

  return (
    <div style={{
      background: colors.nodeBg,
      border: `2px solid ${selected ? '#58a6ff' : color}`,
      borderRadius: 8,
      padding: '10px 16px',
      minWidth: 140,
      boxShadow: selected ? `0 0 8px ${color}66` : '0 2px 4px rgba(0,0,0,0.2)',
      cursor: 'pointer',
      transition: 'box-shadow 0.2s',
    }}>
      <Handle type="target" position={Position.Top} style={{ background: color }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <div>
          <div style={{ color: colors.textPrimary, fontSize: 13, fontWeight: 600 }}>
            {nodeData.label}
          </div>
          <div style={{ color: colors.textSecondary, fontSize: 10, marginTop: 2 }}>
            {nodeData.nodeType}
            {nodeData.nodeData.ip && ` · ${nodeData.nodeData.ip}`}
            {nodeData.nodeData.port && `:${nodeData.nodeData.port}`}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: color }} />
    </div>
  )
})

TopologyNodeComponent.displayName = 'TopologyNodeComponent'
