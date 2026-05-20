import { memo, useState } from 'react'
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
  const [hovered, setHovered] = useState(false)
  const showHandles = selected || hovered

  return (
    <div
      style={{
        background: colors.nodeBg,
        border: `2px solid ${selected ? '#58a6ff' : 'rgba(76, 154, 255, 0.3)'}`,
        borderRadius: 8,
        padding: '10px 16px',
        minWidth: 140,
        boxShadow: selected ? '0 0 14px rgba(88, 166, 255, 0.45), 0 0 4px rgba(88, 166, 255, 0.3)' : '0 2px 4px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        outline: selected ? '2px solid rgba(88, 166, 255, 0.25)' : 'none',
        outlineOffset: 2,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle type="target" position={Position.Top} style={{ background: NODE_COLOR, visibility: showHandles ? 'visible' : 'hidden' }} />
      <Handle type="source" position={Position.Left} style={{ background: NODE_COLOR, visibility: showHandles ? 'visible' : 'hidden' }} />
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
      <Handle type="source" position={Position.Bottom} style={{ background: NODE_COLOR, visibility: showHandles ? 'visible' : 'hidden' }} />
      <Handle type="target" position={Position.Right} style={{ background: NODE_COLOR, visibility: showHandles ? 'visible' : 'hidden' }} />
    </div>
  )
})

TopologyNodeComponent.displayName = 'TopologyNodeComponent'
