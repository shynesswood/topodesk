import { useState } from 'react'
import { Form, Input, InputNumber, Button, Collapse, message } from 'antd'
import { DeleteOutlined, LinkOutlined } from '@ant-design/icons'
import { useTopologyStore } from '../../stores/topologyStore'
import { useUIStore } from '../../stores/uiStore'
import { testConnection } from '../../services/sshService'
import type { SoftwareInfo } from '../../types'

const { TextArea } = Input

const emptySoftware = (): SoftwareInfo => ({
  name: '',
  installPath: '',
  dataPath: '',
  logPath: '',
  startCommand: '',
  stopCommand: '',
  restartCommand: '',
})

export function NodePanel() {
  const selectedNodeId = useUIStore((s) => s.selectedNodeId)
  const closePanel = useUIStore((s) => s.closePanel)
  const nodes = useTopologyStore((s) => s.nodes)
  const updateNode = useTopologyStore((s) => s.updateNode)
  const removeNode = useTopologyStore((s) => s.removeNode)

  const node = nodes.find((n) => n.id === selectedNodeId)
  if (!node) return null

  const [testingSSH, setTestingSSH] = useState(false)
  const [sshResult, setSshResult] = useState<{ success: boolean; message: string } | null>(null)

  const currentNode = node
  const sshInfo = node.ssh

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
        currentNode.ip,
        sshInfo.port || 22,
        sshInfo.username || '',
        sshInfo.password || '',
        sshInfo.privateKey || ''
      )
      setSshResult(result)
      if (result.success) {
        message.success('SSH 连接成功')
      } else {
        message.error(result.message)
      }
    } catch {
      message.error('SSH 连接测试失败')
    } finally {
      setTestingSSH(false)
    }
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
                <Form.Item label="服务器名称" style={{ marginBottom: 8 }}>
                  <Input
                    value={currentNode.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </Form.Item>
                <Form.Item label="IP 地址" style={{ marginBottom: 8 }}>
                  <Input
                    value={currentNode.ip || ''}
                    onChange={(e) => handleChange('ip', e.target.value)}
                  />
                </Form.Item>
                <Form.Item label="简介" style={{ marginBottom: 8 }}>
                  <TextArea
                    rows={2}
                    value={currentNode.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                  />
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
                    <Input
                      value={sshInfo?.username || ''}
                      onChange={(e) => handleSSHChange('username', e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item label="密码" style={{ marginBottom: 8 }}>
                    <Input.Password
                      value={sshInfo?.password || ''}
                      onChange={(e) => handleSSHChange('password', e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item label="私钥" style={{ marginBottom: 8 }}>
                    <TextArea
                      rows={3}
                      value={sshInfo?.privateKey || ''}
                      onChange={(e) => handleSSHChange('privateKey', e.target.value)}
                      placeholder="-----BEGIN RSA PRIVATE KEY-----"
                    />
                  </Form.Item>
                  <Form.Item label="SSH 端口" style={{ marginBottom: 8 }}>
                    <InputNumber
                      value={sshInfo?.port || 22}
                      onChange={(v) => handleSSHChange('port', v)}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Form>

                <Button
                  type="primary"
                  size="small"
                  icon={<LinkOutlined />}
                  onClick={handleTestSSH}
                  loading={testingSSH}
                  block
                  style={{ marginBottom: 8 }}
                >
                  测试连接
                </Button>

                {sshResult && (
                  <div style={{
                    padding: '6px 8px',
                    marginBottom: 8,
                    borderRadius: 4,
                    background: sshResult.success ? 'rgba(82, 196, 26, 0.1)' : 'rgba(255, 77, 79, 0.1)',
                    border: `1px solid ${sshResult.success ? '#52c41a' : '#ff4d4f'}`,
                    fontSize: 11,
                  }}>
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
              <div>
                {(currentNode.software || []).map((sw, i) => (
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
                            const list = [...(currentNode.software || [])]
                            list[i] = { ...list[i], name: e.target.value }
                            handleChange('software', list)
                          }}
                        />
                      </Form.Item>
                      <Form.Item label="安装路径" style={{ marginBottom: 4 }}>
                        <Input
                          value={sw.installPath || ''}
                          onChange={(e) => {
                            const list = [...(currentNode.software || [])]
                            list[i] = { ...list[i], installPath: e.target.value }
                            handleChange('software', list)
                          }}
                        />
                      </Form.Item>
                      <Form.Item label="数据路径" style={{ marginBottom: 4 }}>
                        <Input
                          value={sw.dataPath || ''}
                          onChange={(e) => {
                            const list = [...(currentNode.software || [])]
                            list[i] = { ...list[i], dataPath: e.target.value }
                            handleChange('software', list)
                          }}
                        />
                      </Form.Item>
                      <Form.Item label="日志路径" style={{ marginBottom: 4 }}>
                        <Input
                          value={sw.logPath || ''}
                          onChange={(e) => {
                            const list = [...(currentNode.software || [])]
                            list[i] = { ...list[i], logPath: e.target.value }
                            handleChange('software', list)
                          }}
                        />
                      </Form.Item>
                      <Form.Item label="启动命令" style={{ marginBottom: 4 }}>
                        <Input
                          value={sw.startCommand || ''}
                          onChange={(e) => {
                            const list = [...(currentNode.software || [])]
                            list[i] = { ...list[i], startCommand: e.target.value }
                            handleChange('software', list)
                          }}
                        />
                      </Form.Item>
                      <Form.Item label="停止命令" style={{ marginBottom: 4 }}>
                        <Input
                          value={sw.stopCommand || ''}
                          onChange={(e) => {
                            const list = [...(currentNode.software || [])]
                            list[i] = { ...list[i], stopCommand: e.target.value }
                            handleChange('software', list)
                          }}
                        />
                      </Form.Item>
                      <Form.Item label="重启命令" style={{ marginBottom: 4 }}>
                        <Input
                          value={sw.restartCommand || ''}
                          onChange={(e) => {
                            const list = [...(currentNode.software || [])]
                            list[i] = { ...list[i], restartCommand: e.target.value }
                            handleChange('software', list)
                          }}
                        />
                      </Form.Item>
                    </Form>
                    <Button
                      type="text" danger size="small"
                      onClick={() => {
                        const list = (currentNode.software || []).filter((_, j) => j !== i)
                        handleChange('software', list)
                      }}
                    >删除</Button>
                  </div>
                ))}
                <Button size="small" block
                  onClick={() => {
                    const list = [...(currentNode.software || []), emptySoftware()]
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
