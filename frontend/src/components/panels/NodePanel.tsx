import { useState } from 'react'
import { Form, Input, InputNumber, Button, Collapse, message, Select, Space } from 'antd'
import { DeleteOutlined, LinkOutlined, PlusOutlined } from '@ant-design/icons'
import { useTopologyStore } from '../../stores/topologyStore'
import { useUIStore } from '../../stores/uiStore'
import { testConnection } from '../../services/sshService'
import type { SoftwareInfo } from '../../types'

const { TextArea } = Input

const SUGGESTED_KEYS = [
  'version', 'installPath', 'dataPath', 'logPath', 'configPath',
  'startCommand', 'stopCommand', 'restartCommand',
  'username', 'password', 'port',
]

const emptySoftware = (): SoftwareInfo => ({
  name: '',
  props: {},
})

export function NodePanel() {
  const selectedNodeId = useUIStore((s) => s.selectedNodeId)
  const closePanel = useUIStore((s) => s.closePanel)
  const nodes = useTopologyStore((s) => s.nodes)
  const updateNode = useTopologyStore((s) => s.updateNode)
  const removeNode = useTopologyStore((s) => s.removeNode)

  const node = nodes.find((n) => n.id === selectedNodeId)
  if (!node) return null

  const currentNode = node
  const sshInfo = node.ssh

  const collapseStyle: React.CSSProperties = { fontSize: 12 }

  const [testingSSH, setTestingSSH] = useState(false)
  const [sshResult, setSshResult] = useState<{ success: boolean; message: string } | null>(null)

  function handleChange(field: string, value: unknown) {
    updateNode(currentNode.id, { [field]: value })
  }

  function handleSSHChange(field: string, value: unknown) {
    updateNode(currentNode.id, {
      ssh: { ...sshInfo, [field]: value },
    })
  }

  function handleDelete() {
    removeNode(currentNode.id)
    closePanel()
  }

  async function handleTestSSH() {
    if (!currentNode.ip) {
      message.warning('请先设置 IP 地址')
      return
    }
    if (!sshInfo?.username) {
      message.warning('请先设置 SSH 用户名')
      return
    }
    setTestingSSH(true)
    try {
      const result = await testConnection(
        currentNode.ip, sshInfo.port || 22, sshInfo.username || '',
        sshInfo.password || '', sshInfo.privateKey || ''
      )
      setSshResult(result)
      if (result.success) message.success('SSH 连接成功')
      else message.error(result.message)
    } catch {
      message.error('SSH 连接测试失败')
    } finally {
      setTestingSSH(false)
    }
  }

  function handleSoftwareChange(index: number, field: string, value: string) {
    const list = [...(currentNode.software || [])]
    list[index] = { ...list[index], [field]: value }
    handleChange('software', list)
  }

  function handlePropChange(swIdx: number, key: string, value: string) {
    const list = [...(currentNode.software || [])]
    const sw = { ...list[swIdx] }
    sw.props = { ...sw.props, [key]: value }
    if (!value) delete sw.props[key]
    list[swIdx] = sw
    handleChange('software', list)
  }

  function handleAddProp(swIdx: number, key: string) {
    if (!key.trim()) return
    const list = [...(currentNode.software || [])]
    const sw = { ...list[swIdx] }
    sw.props = { ...sw.props, [key.trim()]: '' }
    list[swIdx] = sw
    handleChange('software', list)
  }

  function handleRemoveProp(swIdx: number, key: string) {
    const list = [...(currentNode.software || [])]
    const sw = { ...list[swIdx] }
    sw.props = { ...sw.props }
    delete sw.props[key]
    list[swIdx] = sw
    handleChange('software', list)
  }

  function handleAddSoftware() {
    const list = [...(currentNode.software || []), emptySoftware()]
    handleChange('software', list)
  }

  function handleRemoveSoftware(index: number) {
    const list = (currentNode.software || []).filter((_, j) => j !== index)
    handleChange('software', list)
  }

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
                <Form.Item label="服务器名称" style={{ marginBottom: 8 }}>
                  <Input value={currentNode.name} onChange={(e) => handleChange('name', e.target.value)} />
                </Form.Item>
                <Form.Item label="IP 地址" style={{ marginBottom: 8 }}>
                  <Input value={currentNode.ip || ''} onChange={(e) => handleChange('ip', e.target.value)} />
                </Form.Item>
                <Form.Item label="简介" style={{ marginBottom: 8 }}>
                  <TextArea rows={2} value={currentNode.description || ''} onChange={(e) => handleChange('description', e.target.value)} />
                </Form.Item>
                <Form.Item label="标签" style={{ marginBottom: 8 }}>
                  <Select mode="tags" value={currentNode.tags || []} onChange={(v) => handleChange('tags', v)} placeholder="添加标签" size="small" />
                </Form.Item>
              </Form>
            ),
          },
          {
            key: 'ssh',
            label: 'SSH 信息',
            children: (
              <div>
                <Form layout="vertical" size="small">
                  <Form.Item label="用户名" style={{ marginBottom: 8 }}>
                    <Input value={sshInfo?.username || ''} onChange={(e) => handleSSHChange('username', e.target.value)} />
                  </Form.Item>
                  <Form.Item label="密码" style={{ marginBottom: 8 }}>
                    <Input.Password value={sshInfo?.password || ''} onChange={(e) => handleSSHChange('password', e.target.value)} />
                  </Form.Item>
                  <Form.Item label="私钥" style={{ marginBottom: 8 }}>
                    <TextArea rows={3} value={sshInfo?.privateKey || ''} onChange={(e) => handleSSHChange('privateKey', e.target.value)} placeholder="-----BEGIN RSA PRIVATE KEY-----" />
                  </Form.Item>
                  <Form.Item label="SSH 端口" style={{ marginBottom: 8 }}>
                    <InputNumber value={sshInfo?.port || 22} onChange={(v) => handleSSHChange('port', v)} style={{ width: '100%' }} />
                  </Form.Item>
                </Form>
                <Button type="primary" size="small" icon={<LinkOutlined />} onClick={handleTestSSH} loading={testingSSH} block style={{ marginBottom: 8 }}>
                  测试连接
                </Button>
                {sshResult && (
                  <div style={{ padding: '6px 8px', marginBottom: 8, borderRadius: 4, background: sshResult.success ? 'rgba(82, 196, 26, 0.1)' : 'rgba(255, 77, 79, 0.1)', border: `1px solid ${sshResult.success ? '#52c41a' : '#ff4d4f'}`, fontSize: 11 }}>
                    {sshResult.message}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'software',
            label: '软件信息',
            children: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(currentNode.software || []).map((sw, i) => {
                  const props = sw.props || {}
                  const keys = Object.keys(props)

                  return (
                    <div key={i} style={{ border: '1px solid var(--border-color, #d9d9d9)', borderRadius: 6, padding: 10, position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: keys.length > 0 ? 8 : 0 }}>
                        <Input
                          size="small"
                          value={sw.name}
                          onChange={(e) => handleSoftwareChange(i, 'name', e.target.value)}
                          placeholder="软件名称"
                          style={{ fontWeight: 600, flex: 1 }}
                        />
                        <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => handleRemoveSoftware(i)} />
                      </div>

                      {keys.map((key) => (
                        <div key={key} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 10, color: '#8b949e', minWidth: 90, textAlign: 'right' }}>{key}</span>
                          <Input
                            size="small"
                            value={props[key] || ''}
                            onChange={(e) => handlePropChange(i, key, e.target.value)}
                            style={{ flex: 1 }}
                          />
                          <Button type="text" size="small" danger style={{ padding: 0 }} onClick={() => handleRemoveProp(i, key)}>×</Button>
                        </div>
                      ))}

                      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        <Select
                          size="small"
                          mode="tags"
                          value={[]}
                          onChange={(vals) => {
                            const last = vals[vals.length - 1]
                            if (last) handleAddProp(i, last)
                          }}
                          placeholder="添加属性"
                          style={{ flex: 1 }}
                          options={SUGGESTED_KEYS.map((k) => ({ label: k, value: k }))}
                        />
                      </div>
                    </div>
                  )
                })}
                <Button size="small" icon={<PlusOutlined />} onClick={handleAddSoftware} block>添加软件</Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
