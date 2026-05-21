import { memo, useState } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useThemeColors } from '../../hooks/useThemeColors'

interface TopologyNodeData {
  label: string
  nodeData: Record<string, unknown>
}

const NODE_COLOR = '#4c9aff'

export const TopologyNodeComponent = memo((props: NodeProps) => {
  const { data, selected } = props
  const nodeData = data as unknown as TopologyNodeData
  const colors = useThemeColors()
  const [hovered, setHovered] = useState(false)
  const isSelected = !!selected
  const showHandles = isSelected || hovered
  const tags = (nodeData.nodeData?.tags as string[]) || []

  return (
    <div
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
            {(nodeData.nodeData?.ip as string) || ''}
          </div>
          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 4 }}>
              {tags.map((tag, i) => (
                <span key={i} style={{
                  background: 'rgba(76, 154, 255, 0.15)',
                  color: '#58a6ff',
                  fontSize: 9,
                  padding: '1px 5px',
                  borderRadius: 3,
                  lineHeight: '16px',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: NODE_COLOR, opacity: showHandles ? 1 : 0 }} />
      <Handle type="target" position={Position.Right} style={{ background: NODE_COLOR, opacity: showHandles ? 1 : 0 }} />
    </div>
  )
})

TopologyNodeComponent.displayName = 'TopologyNodeComponent'
