import { useState } from 'react'
import { Form, Input, Select, InputNumber, Button, Collapse, message, Tabs, Space } from 'antd'
import { DeleteOutlined, LinkOutlined, SendOutlined, ScanOutlined } from '@ant-design/icons'
import { useTopologyStore } from '../../stores/topologyStore'
import { useUIStore } from '../../stores/uiStore'
import { NODE_TYPES } from '../../types'
import { testConnection, executeCommand, readLargeFile } from '../../services/sshService'

const { TextArea } = Input

export function NodePanel() {
  const selectedNodeId = useUIStore((s) => s.selectedNodeId)
  const closePanel = useUIStore((s) => s.closePanel)
  const openScannerPanel = useUIStore((s) => s.openScannerPanel)
  const nodes = useTopologyStore((s) => s.nodes)
  const updateNode = useTopologyStore((s) => s.updateNode)
  const removeNode = useTopologyStore((s) => s.removeNode)

  const node = nodes.find((n) => n.id === selectedNodeId)
  if (!node) return null

  const [testingSSH, setTestingSSH] = useState(false)
  const [sshResult, setSshResult] = useState<{ success: boolean; message: string } | null>(null)
  const [command, setCommand] = useState('')
  const [commandOutput, setCommandOutput] = useState('')
  const [executing, setExecuting] = useState(false)
  const [filePath, setFilePath] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [readingFile, setReadingFile] = useState(false)
  const [maxLines, setMaxLines] = useState(100)

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
    } catch (e) {
      message.error('SSH 连接测试失败')
    } finally {
      setTestingSSH(false)
    }
  }

  async function handleExecuteCommand() {
    if (!currentNode.ip || !sshInfo?.username || !command) return
    setExecuting(true)
    try {
      const result = await executeCommand(
        currentNode.ip,
        sshInfo.port || 22,
        sshInfo.username || '',
        sshInfo.password || '',
        sshInfo.privateKey || '',
        command,
        30
      )
      setCommandOutput(result.stdout || result.stderr || result.error || '无输出')
    } catch (e) {
      setCommandOutput('命令执行失败')
    } finally {
      setExecuting(false)
    }
  }

  async function handleReadFile() {
    if (!currentNode.ip || !sshInfo?.username || !filePath) return
    setReadingFile(true)
    try {
      const content = await readLargeFile(
        currentNode.ip,
        sshInfo.port || 22,
        sshInfo.username || '',
        sshInfo.password || '',
        sshInfo.privateKey || '',
        filePath,
        maxLines
      )
      setFileContent(content)
    } catch (e) {
      setFileContent('读取文件失败')
    } finally {
      setReadingFile(false)
    }
  }

  const collapseStyle: React.CSSProperties = { fontSize: 12 }

  return (
    <div style={{ padding: 12, overflow: 'auto', height: '100%', fontSize: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h4 style={{ margin: 0, fontSize: 13 }}>节点详情</h4>
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<ScanOutlined />}
            onClick={() => openScannerPanel(currentNode.id)}
            title="扫描服务器"
          />
          <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={handleDelete} />
        </Space>
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
                    value={currentNode.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </Form.Item>
                <Form.Item label="类型" style={{ marginBottom: 8 }}>
                  <Select
                    value={currentNode.type}
                    onChange={(v) => handleChange('type', v)}
                    options={NODE_TYPES.map((t) => ({ label: t, value: t }))}
                  />
                </Form.Item>
                <Form.Item label="IP 地址" style={{ marginBottom: 8 }}>
                  <Input
                    value={currentNode.ip || ''}
                    onChange={(e) => handleChange('ip', e.target.value)}
                  />
                </Form.Item>
                <Form.Item label="端口" style={{ marginBottom: 8 }}>
                  <InputNumber
                    value={currentNode.port}
                    onChange={(v) => handleChange('port', v)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item label="标签" style={{ marginBottom: 8 }}>
                  <Select
                    mode="tags"
                    value={currentNode.tags || []}
                    onChange={(v) => handleChange('tags', v)}
                    placeholder="添加标签"
                  />
                </Form.Item>
                <Form.Item label="描述" style={{ marginBottom: 8 }}>
                  <TextArea
                    rows={2}
                    value={(currentNode.metadata?.description) || ''}
                    onChange={(e) => handleChange('metadata', { ...currentNode.metadata, description: e.target.value })}
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

                <Tabs
                  size="small"
                  items={[
                    {
                      key: 'cmd',
                      label: '命令执行',
                      children: (
                        <div>
                          <Input
                            size="small"
                            value={command}
                            onChange={(e) => setCommand(e.target.value)}
                            placeholder="输入命令，如: uptime"
                            onPressEnter={handleExecuteCommand}
                            style={{ marginBottom: 8 }}
                          />
                          <Button
                            size="small"
                            icon={<SendOutlined />}
                            onClick={handleExecuteCommand}
                            loading={executing}
                            block
                            style={{ marginBottom: 8 }}
                          >
                            执行
                          </Button>
                          {commandOutput && (
                            <TextArea
                              size="small"
                              rows={6}
                              value={commandOutput}
                              readOnly
                              style={{ fontFamily: 'monospace', fontSize: 11 }}
                            />
                          )}
                        </div>
                      ),
                    },
                    {
                      key: 'file',
                      label: '文件读取',
                      children: (
                        <div>
                          <Input
                            size="small"
                            value={filePath}
                            onChange={(e) => setFilePath(e.target.value)}
                            placeholder="文件路径，如: /etc/nginx/nginx.conf"
                            style={{ marginBottom: 8 }}
                          />
                          <div style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: 11 }}>最大行数:</span>
                            <InputNumber
                              size="small"
                              value={maxLines}
                              onChange={(v) => setMaxLines(v || 100)}
                              min={1}
                              max={1000}
                              style={{ width: 80 }}
                            />
                          </div>
                          <Button
                            size="small"
                            onClick={handleReadFile}
                            loading={readingFile}
                            block
                            style={{ marginBottom: 8 }}
                          >
                            读取文件
                          </Button>
                          {fileContent && (
                            <TextArea
                              size="small"
                              rows={8}
                              value={fileContent}
                              readOnly
                              style={{ fontFamily: 'monospace', fontSize: 11 }}
                            />
                          )}
                        </div>
                      ),
                    },
                  ]}
                />
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
                      <Form.Item label="配置文件路径" style={{ marginBottom: 4 }}>
                        <Input
                          value={sw.configPath || ''}
                          onChange={(e) => {
                            const list = [...(currentNode.software || [])]
                            list[i] = { ...list[i], configPath: e.target.value }
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
                    const list = [...(currentNode.software || []), { name: '', installPath: '', logPath: '', startCommand: '', configPath: '' }]
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
