import { useState } from 'react'
import { Button, Input, List, Space, Tag, Modal, message } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
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
  const groups = useTopologyStore((s) => s.groups)
  const nodes = useTopologyStore((s) => s.nodes)
  const addGroup = useTopologyStore((s) => s.addGroup)
  const removeGroup = useTopologyStore((s) => s.removeGroup)
  const updateGroup = useTopologyStore((s) => s.updateGroup)
  const addNodesToGroup = useTopologyStore((s) => s.addNodesToGroup)
  const removeNodesFromGroup = useTopologyStore((s) => s.removeNodesFromGroup)
  const selectedNodeIds = useTopologyStore((s) => s.selectedNodeIds)
  const closePanel = useUIStore((s) => s.closePanel)
  const colors = useThemeColors()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupColor, setNewGroupColor] = useState(GROUP_COLORS[0])

  function handleAddGroup() {
    if (!newGroupName.trim()) return
    addGroup(newGroupName.trim(), selectedNodeIds.length > 0 ? [...selectedNodeIds] : [], newGroupColor)
    setNewGroupName('')
    setNewGroupColor(GROUP_COLORS[0])
    setShowAddModal(false)
    message.success('分组已添加')
  }

  function handleStartEdit(group: { id: string; name: string }) {
    setEditingId(group.id)
    setEditName(group.name)
  }

  function handleSaveEdit(id: string) {
    if (!editName.trim()) return
    updateGroup(id, { name: editName.trim() })
    setEditingId(null)
    setEditName('')
  }

  function handleDeleteGroup(id: string) {
    removeGroup(id)
    message.success('分组已删除')
  }

  function handleAddSelectedToGroup(groupId: string) {
    if (selectedNodeIds.length === 0) {
      message.warning('请先选择节点')
      return
    }
    addNodesToGroup(groupId, selectedNodeIds)
    message.success('已添加选中节点到分组')
  }

  function handleRemoveNodeFromGroup(groupId: string, nodeId: string) {
    removeNodesFromGroup(groupId, [nodeId])
  }

  function handleColorChange(groupId: string, color: string) {
    updateGroup(groupId, { color })
  }

  return (
    <div style={{ padding: 12, overflow: 'auto', height: '100%', fontSize: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h4 style={{ margin: 0, fontSize: 13 }}>节点分组</h4>
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => setShowAddModal(true)}
          >
            添加
          </Button>
          <Button type="text" size="small" onClick={closePanel}>关闭</Button>
        </Space>
      </div>

      {groups.length === 0 ? (
        <div style={{ color: colors.textSecondary, textAlign: 'center', padding: '20px 0' }}>
          暂无分组，点击"添加"创建
        </div>
      ) : (
        <List
          size="small"
          dataSource={groups}
          renderItem={(group) => (
            <List.Item
              style={{
                border: `1px solid ${colors.border}`,
                borderRadius: 4,
                marginBottom: 4,
                padding: '8px 12px',
              }}
              actions={[
                <Button
                  key="add"
                  type="text"
                  size="small"
                  onClick={() => handleAddSelectedToGroup(group.id)}
                  title="添加选中节点"
                >
                  +
                </Button>,
                <Button
                  key="edit"
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleStartEdit(group)}
                />,
                <Button
                  key="delete"
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteGroup(group.id)}
                />,
              ]}
            >
              <div style={{ width: '100%' }}>
                {editingId === group.id ? (
                  <Input
                    size="small"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onPressEnter={() => handleSaveEdit(group.id)}
                    onBlur={() => handleSaveEdit(group.id)}
                    autoFocus
                    style={{ marginBottom: 4 }}
                  />
                ) : (
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{group.name}</div>
                )}
                <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                  {GROUP_COLORS.map((c) => (
                    <div
                      key={c}
                      onClick={() => handleColorChange(group.id, c)}
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        background: c,
                        border: group.color === c ? '2px solid #58a6ff' : '2px solid transparent',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {group.nodeIds.map((nodeId) => {
                    const node = nodes.find((n) => n.id === nodeId)
                    return (
                      <Tag
                        key={nodeId}
                        closable
                        onClose={() => handleRemoveNodeFromGroup(group.id, nodeId)}
                        style={{ fontSize: 10, margin: 0 }}
                      >
                        {node?.name || nodeId}
                      </Tag>
                    )
                  })}
                  {group.nodeIds.length === 0 && (
                    <span style={{ color: colors.textSecondary, fontSize: 10 }}>空分组，Shift+选择节点后点 + 添加</span>
                  )}
                </div>
              </div>
            </List.Item>
          )}
        />
      )}

      <Modal
        title="添加分组"
        open={showAddModal}
        onOk={handleAddGroup}
        onCancel={() => { setShowAddModal(false); setNewGroupName('') }}
        okText="添加"
        cancelText="取消"
      >
        <Input
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="分组名称"
          onPressEnter={handleAddGroup}
          autoFocus
        />
        <div style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 6, fontSize: 12 }}>选择颜色：</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {GROUP_COLORS.map((c) => (
              <div
                key={c}
                onClick={() => setNewGroupColor(c)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  background: c,
                  border: newGroupColor === c ? '2px solid #58a6ff' : '2px solid transparent',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </div>
        {selectedNodeIds.length > 0 && (
          <div style={{ marginTop: 8, color: colors.textSecondary, fontSize: 11 }}>
            将包含 {selectedNodeIds.length} 个选中节点
          </div>
        )}
      </Modal>
    </div>
  )
}
