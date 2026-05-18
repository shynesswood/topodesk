import { NODE_TYPES, NodeType } from '../../types'
import { useTopologyStore } from '../../stores/topologyStore'
import { useUIStore } from '../../stores/uiStore'
import { useThemeColors } from '../../hooks/useThemeColors'
import { GroupOutlined } from '@ant-design/icons'

const NODE_COLORS: Record<string, string> = {
  'Server': '#4c9aff',
  'Database': '#f5a623',
  'Redis': '#dc3545',
  'MQ': '#6f42c1',
  'Gateway': '#28a745',
  'API': '#17a2b8',
  'External Service': '#6c757d',
}

export function Sidebar() {
  const addNode = useTopologyStore((s) => s.addNode)
  const openGroupPanel = useUIStore((s) => s.openGroupPanel)
  const colors = useThemeColors()

  function handleAddNode(type: NodeType) {
    addNode(type, `New ${type}`, { x: 100 + Math.random() * 300, y: 100 + Math.random() * 300 })
  }

  return (
    <div style={{ padding: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ color: colors.textSecondary, fontSize: 11, textTransform: 'uppercase', margin: 0 }}>
          节点类型
        </h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NODE_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => handleAddNode(type)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              border: `1px solid ${colors.border}`,
              borderRadius: 4,
              background: colors.nodeBg,
              color: colors.textPrimary,
              cursor: 'pointer',
              fontSize: 12,
              textAlign: 'left' as const,
            }}
          >
            <span style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: NODE_COLORS[type] || '#6c757d',
              flexShrink: 0,
            }} />
            {type}
          </button>
        ))}
      </div>

      <div style={{ borderTop: `1px solid ${colors.border}`, margin: '12px 0' }} />

      <button
        onClick={openGroupPanel}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px',
          border: `1px solid ${colors.border}`,
          borderRadius: 4,
          background: colors.nodeBg,
          color: colors.textPrimary,
          cursor: 'pointer',
          fontSize: 12,
          width: '100%',
          textAlign: 'left' as const,
        }}
      >
        <GroupOutlined />
        管理分组
      </button>
    </div>
  )
}
