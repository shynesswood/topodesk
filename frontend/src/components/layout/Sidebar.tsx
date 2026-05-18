import { useTopologyStore } from '../../stores/topologyStore'
import { useUIStore } from '../../stores/uiStore'
import { useThemeColors } from '../../hooks/useThemeColors'
import { GroupOutlined, PlusOutlined } from '@ant-design/icons'

export function Sidebar() {
  const addNode = useTopologyStore((s) => s.addNode)
  const openGroupPanel = useUIStore((s) => s.openGroupPanel)
  const colors = useThemeColors()

  function handleAddNode() {
    addNode('新服务器', { x: 100 + Math.random() * 300, y: 100 + Math.random() * 300 })
  }

  return (
    <div style={{ padding: 8 }}>
      <button
        onClick={handleAddNode}
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
          marginBottom: 4,
        }}
      >
        <PlusOutlined />
        添加服务器
      </button>

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
