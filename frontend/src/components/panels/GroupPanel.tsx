import { useState } from 'react'
import { Button, Input, Tag, Space, message } from 'antd'
import { DeleteOutlined, EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { useTopologyStore } from '../../stores/topologyStore'
import { useUIStore } from '../../stores/uiStore'
import { useThemeColors } from '../../hooks/useThemeColors'

const GROUP_COLORS = [
  'rgba(76, 154, 255, 0.08)',
  'rgba(82, 196, 26, 0.08)',
  'rgba(250, 173, 20, 0.08)',
  'rgba(255, 77, 79, 0.08)',
  'rgba(114, 46, 209, 0.08)',
  'rgba(19, 194, 194, 0.08)',
]

export function GroupPanel() {
  const selectedGroupId = useUIStore((s) => s.selectedGroupId)
  const closePanel = useUIStore((s) => s.closePanel)
  const groups = useTopologyStore((s) => s.groups)
  const nodes = useTopologyStore((s) => s.nodes)
  const updateGroup = useTopologyStore((s) => s.updateGroup)
  const removeGroup = useTopologyStore((s) => s.removeGroup)
  const colors = useThemeColors()

  const group = groups.find((g) => g.id === selectedGroupId)
  if (!group) {
    return (
      <div style={{ padding: 12, color: colors.textSecondary, fontSize: 12 }}>
        <p>请点击画布中的分组</p>
        <Button size="small" onClick={closePanel}>关闭</Button>
      </div>
    )
  }

  const [editingName, setEditingName] = useState(false)
  const [editName, setEditName] = useState('')

  function handleStartEdit() {
    setEditName(group!.name)
    setEditingName(true)
  }

  function handleSaveName() {
    if (editName.trim()) {
      updateGroup(group!.id, { name: editName.trim() })
    }
    setEditingName(false)
  }

  function handleDelete() {
    removeGroup(group!.id)
    closePanel()
    message.success('分组已删除')
  }

  const memberNodes = group.nodeIds
    .map((nid) => nodes.find((n) => n.id === nid))
    .filter(Boolean) as Array<{ id: string; name: string }>

  return (
    <div style={{ padding: 12, overflow: 'auto', height: '100%', fontSize: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        {editingName ? (
          <Space size="small">
            <Input
              size="small"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onPressEnter={handleSaveName}
              style={{ width: 140, height: 24 }}
              autoFocus
            />
            <Button type="text" size="small" icon={<CheckOutlined />} onClick={handleSaveName} />
            <Button type="text" size="small" icon={<CloseOutlined />} onClick={() => setEditingName(false)} />
          </Space>
        ) : (
          <Space size="small">
            <h4 style={{ margin: 0, fontSize: 13 }}>{group.name}</h4>
            <Button type="text" size="small" icon={<EditOutlined />} onClick={handleStartEdit} />
          </Space>
        )}
        <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={handleDelete} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 4 }}>颜色</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {GROUP_COLORS.map((c) => (
            <div
              key={c}
              onClick={() => updateGroup(group.id, { color: c })}
              style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                background: c,
                border: group.color === c ? '2px solid #58a6ff' : '2px solid transparent',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 8 }}>
          成员节点 ({memberNodes.length})
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {memberNodes.map((n) => (
            <Tag
              key={n.id}
              style={{ fontSize: 10, margin: 0 }}
            >
              {n.name}
            </Tag>
          ))}
          {memberNodes.length === 0 && (
            <span style={{ color: colors.textSecondary, fontSize: 10 }}>
              将节点拖入分组框即可加入
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
