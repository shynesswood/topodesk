import { Form, Input, Select, InputNumber, Button, Collapse } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useTopologyStore } from '../../stores/topologyStore'
import { useUIStore } from '../../stores/uiStore'
import { useProjectStore } from '../../stores/projectStore'
import { NODE_TYPES } from '../../types'

const { TextArea } = Input

export function NodePanel() {
  const selectedNodeId = useUIStore((s) => s.selectedNodeId)
  const closePanel = useUIStore((s) => s.closePanel)
  const nodes = useTopologyStore((s) => s.nodes)
  const updateNode = useTopologyStore((s) => s.updateNode)
  const removeNode = useTopologyStore((s) => s.removeNode)
  const markDirty = useProjectStore((s) => s.markDirty)

  const node = nodes.find((n) => n.id === selectedNodeId)
  if (!node) return null

  function handleChange(field: string, value: unknown) {
    updateNode(node!.id, { [field]: value })
    markDirty()
  }

  function handleSSHChange(field: string, value: unknown) {
    updateNode(node!.id, {
      ssh: { ...node!.ssh, [field]: value },
    })
    markDirty()
  }

  function handleDelete() {
    removeNode(node!.id)
    closePanel()
  }

  const collapseStyle: React.CSSProperties = { fontSize: 12 }

  return (
    <div style={{ padding: 12, overflow: 'auto', height: '100%', fontSize: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h4 style={{ margin: 0, fontSize: 13 }}>节点详情</h4>
        <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={handleDelete} />
      </div>

      <Collapse
        defaultActiveKey={['basic']}
        ghost
        size="small"
        style={collapseStyle}
        items={[
          {
            key: 'basic',
            label: '基础信息',
            children: (
              <Form layout="vertical" size="small">
                <Form.Item label="名称" style={{ marginBottom: 8 }}>
                  <Input
                    value={node.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </Form.Item>
                <Form.Item label="类型" style={{ marginBottom: 8 }}>
                  <Select
                    value={node.type}
                    onChange={(v) => handleChange('type', v)}
                    options={NODE_TYPES.map((t) => ({ label: t, value: t }))}
                  />
                </Form.Item>
                <Form.Item label="IP 地址" style={{ marginBottom: 8 }}>
                  <Input
                    value={node.ip || ''}
                    onChange={(e) => handleChange('ip', e.target.value)}
                  />
                </Form.Item>
                <Form.Item label="端口" style={{ marginBottom: 8 }}>
                  <InputNumber
                    value={node.port}
                    onChange={(v) => handleChange('port', v)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item label="标签" style={{ marginBottom: 8 }}>
                  <Select
                    mode="tags"
                    value={node.tags || []}
                    onChange={(v) => handleChange('tags', v)}
                    placeholder="添加标签"
                  />
                </Form.Item>
                <Form.Item label="描述" style={{ marginBottom: 8 }}>
                  <TextArea
                    rows={2}
                    value={(node.metadata?.description) || ''}
                    onChange={(e) => handleChange('metadata', { ...node.metadata, description: e.target.value })}
                  />
                </Form.Item>
              </Form>
            ),
          },
          {
            key: 'ssh',
            label: 'SSH 信息',
            children: (
              <Form layout="vertical" size="small">
                <Form.Item label="用户名" style={{ marginBottom: 8 }}>
                  <Input
                    value={node.ssh?.username || ''}
                    onChange={(e) => handleSSHChange('username', e.target.value)}
                  />
                </Form.Item>
                <Form.Item label="密码" style={{ marginBottom: 8 }}>
                  <Input.Password
                    value={node.ssh?.password || ''}
                    onChange={(e) => handleSSHChange('password', e.target.value)}
                  />
                </Form.Item>
                <Form.Item label="SSH 端口" style={{ marginBottom: 8 }}>
                  <InputNumber
                    value={node.ssh?.port || 22}
                    onChange={(v) => handleSSHChange('port', v)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Form>
            ),
          },
          {
            key: 'software',
            label: '软件信息',
            children: (
              <div>
                {(node.software || []).map((sw, i) => (
                  <div key={i} style={{
                    border: '1px solid var(--border-color, #d9d9d9)',
                    borderRadius: 4,
                    padding: 8,
                    marginBottom: 8,
                  }}>
                    <Form layout="vertical" size="small">
                      <Form.Item label="软件名称" style={{ marginBottom: 4 }}>
                        <Input
                          value={sw.name}
                          onChange={(e) => {
                            const list = [...(node.software || [])]
                            list[i] = { ...list[i], name: e.target.value }
                            handleChange('software', list)
                          }}
                        />
                      </Form.Item>
                      <Form.Item label="安装路径" style={{ marginBottom: 4 }}>
                        <Input
                          value={sw.installPath || ''}
                          onChange={(e) => {
                            const list = [...(node.software || [])]
                            list[i] = { ...list[i], installPath: e.target.value }
                            handleChange('software', list)
                          }}
                        />
                      </Form.Item>
                      <Form.Item label="启动命令" style={{ marginBottom: 4 }}>
                        <Input
                          value={sw.startCommand || ''}
                          onChange={(e) => {
                            const list = [...(node.software || [])]
                            list[i] = { ...list[i], startCommand: e.target.value }
                            handleChange('software', list)
                          }}
                        />
                      </Form.Item>
                      <Form.Item label="日志路径" style={{ marginBottom: 4 }}>
                        <Input
                          value={sw.logPath || ''}
                          onChange={(e) => {
                            const list = [...(node.software || [])]
                            list[i] = { ...list[i], logPath: e.target.value }
                            handleChange('software', list)
                          }}
                        />
                      </Form.Item>
                      <Form.Item label="配置文件路径" style={{ marginBottom: 4 }}>
                        <Input
                          value={sw.configPath || ''}
                          onChange={(e) => {
                            const list = [...(node.software || [])]
                            list[i] = { ...list[i], configPath: e.target.value }
                            handleChange('software', list)
                          }}
                        />
                      </Form.Item>
                    </Form>
                    <Button
                      type="text" danger size="small"
                      onClick={() => {
                        const list = (node.software || []).filter((_, j) => j !== i)
                        handleChange('software', list)
                      }}
                    >删除</Button>
                  </div>
                ))}
                <Button size="small" block
                  onClick={() => {
                    const list = [...(node.software || []), { name: '', installPath: '', logPath: '', startCommand: '', configPath: '' }]
                    handleChange('software', list)
                  }}
                >添加软件</Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
