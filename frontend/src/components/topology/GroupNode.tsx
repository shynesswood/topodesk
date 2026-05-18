import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useThemeColors } from '../../hooks/useThemeColors'

interface GroupNodeData {
  label: string
  color?: string
}

export const GroupNodeComponent = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as GroupNodeData
  const colors = useThemeColors()
  const bgColor = nodeData.color || 'rgba(76, 154, 255, 0.08)'

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
      }}>
        {nodeData.label}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
    </div>
  )
})

GroupNodeComponent.displayName = 'GroupNodeComponent'
