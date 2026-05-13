import { memo } from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react'
import { useThemeColors } from '../../hooks/useThemeColors'

interface TopologyEdgeData {
  edgeType?: string
  edgeData?: {
    id: string
    source: string
    target: string
    type?: string
    label?: string
  }
}

const EDGE_COLORS: Record<string, string> = {
  'HTTP': '#58a6ff',
  'HTTPS': '#3fb950',
  'TCP': '#d2a8ff',
  'MySQL': '#f5a623',
  'Redis': '#dc3545',
  'MQ': '#6f42c1',
  'RPC': '#f78166',
  'SSH': '#8b949e',
  'Custom': '#c9d1d9',
}

export const TopologyEdgeComponent = memo((props: EdgeProps) => {
  const {
    id,
    sourceX, sourceY,
    targetX, targetY,
    sourcePosition, targetPosition,
    selected,
    data,
    markerEnd,
  } = props
  const colors = useThemeColors()
  const edgeData = data as TopologyEdgeData | undefined
  const edgeType = edgeData?.edgeType || 'Custom'
  const color = EDGE_COLORS[edgeType] || '#c9d1d9'
  const label = edgeData?.edgeData?.label || edgeType

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? '#58a6ff' : color,
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: edgeType === 'Custom' ? '5 5' : undefined,
        }}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: colors.nodeBg,
            border: `1px solid ${color}`,
            borderRadius: 4,
            padding: '2px 6px',
            fontSize: 10,
            color: colors.textPrimary,
            pointerEvents: 'all',
          }}
        >
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  )
})

TopologyEdgeComponent.displayName = 'TopologyEdgeComponent'
