import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { TopologyNode } from '../../types'
import { useThemeColors } from '../../hooks/useThemeColors'

interface TopologyNodeData {
  label: string
  nodeData: TopologyNode
}

const NODE_COLOR = '#4c9aff'

export const TopologyNodeComponent = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as TopologyNodeData
  const colors = useThemeColors()

  return (
    <div style={{
      background: colors.nodeBg,
      border: `2px solid ${selected ? '#58a6ff' : NODE_COLOR}`,
      borderRadius: 8,
      padding: '10px 16px',
      minWidth: 140,
      boxShadow: selected ? '0 0 8px rgba(76, 154, 255, 0.4)' : '0 2px 4px rgba(0,0,0,0.2)',
      cursor: 'pointer',
      transition: 'box-shadow 0.2s',
    }}>
      <Handle type="target" position={Position.Top} style={{ background: NODE_COLOR }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>{'\u{1F5A5}'}</span>
        <div>
          <div style={{ color: colors.textPrimary, fontSize: 13, fontWeight: 600 }}>
            {nodeData.label}
          </div>
          <div style={{ color: colors.textSecondary, fontSize: 10, marginTop: 2 }}>
            {nodeData.nodeData.ip || ''}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: NODE_COLOR }} />
    </div>
  )
})

TopologyNodeComponent.displayName = 'TopologyNodeComponent'
