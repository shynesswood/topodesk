import { memo } from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react'
import { useThemeColors } from '../../hooks/useThemeColors'

interface TopologyEdgeData {
  edgeData?: {
    label?: string
  }
}

const EDGE_COLOR = '#58a6ff'

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
  const label = edgeData?.edgeData?.label || ''

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
      {selected && (
        <BaseEdge
          id={`${id}-glow`}
          path={edgePath}
          style={{
            stroke: '#58a6ff',
            strokeWidth: 8,
            opacity: 0.18,
          }}
        />
      )}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? '#58a6ff' : EDGE_COLOR,
          strokeWidth: selected ? 3 : 2,
        }}
        markerEnd={markerEnd}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: colors.nodeBg,
              border: `1px solid ${selected ? '#58a6ff' : EDGE_COLOR}`,
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: 10,
              color: selected ? '#58a6ff' : colors.textPrimary,
              fontWeight: selected ? 600 : 400,
              boxShadow: selected ? '0 0 8px rgba(88, 166, 255, 0.35)' : undefined,
              pointerEvents: 'all',
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
})

TopologyEdgeComponent.displayName = 'TopologyEdgeComponent'
