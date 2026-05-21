import { useTopologyStore } from '../../stores/topologyStore'
import { useThemeColors } from '../../hooks/useThemeColors'
import { PlusOutlined, AppstoreAddOutlined } from '@ant-design/icons'
import { TopologyTree } from '../topology/TopologyTree'

export function Sidebar() {
  const addNode = useTopologyStore((s) => s.addNode)
  const addGroup = useTopologyStore((s) => s.addGroup)
  const colors = useThemeColors()

  function handleAddNode() {
    addNode('新服务器', { x: 100 + Math.random() * 300, y: 100 + Math.random() * 300 })
  }

  function handleAddGroup() {
    addGroup('新分组', [], undefined, { x: 120 + Math.random() * 200, y: 120 + Math.random() * 200 })
  }

  return (
    <div style={{ padding: 8, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div>
        <button
          onClick={handleAddNode}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
            border: `1px solid ${colors.border}`, borderRadius: 4,
            background: colors.nodeBg, color: colors.textPrimary,
            cursor: 'pointer', fontSize: 12, width: '100%',
            textAlign: 'left' as const, marginBottom: 4,
          }}
        >
          <PlusOutlined />
          添加服务器
        </button>

        <button
          onClick={handleAddGroup}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
            border: `1px solid ${colors.border}`, borderRadius: 4,
            background: colors.nodeBg, color: colors.textPrimary,
            cursor: 'pointer', fontSize: 12, width: '100%',
            textAlign: 'left' as const,
          }}
        >
          <AppstoreAddOutlined />
          新建分组
        </button>
      </div>

      <div style={{ borderTop: `1px solid ${colors.border}`, margin: '10px 0' }} />

      <div style={{ flex: 1, overflow: 'auto' }}>
        <TopologyTree />
      </div>
    </div>
  )
}
