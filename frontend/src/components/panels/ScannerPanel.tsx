import { useState } from 'react'
import { Button, Input, InputNumber, Select, Table, Tag, Collapse, Spin, message, Space } from 'antd'
import { ScanOutlined, ReloadOutlined, DockerOutlined } from '@ant-design/icons'
import { useTopologyStore } from '../../stores/topologyStore'
import { useUIStore } from '../../stores/uiStore'
import { useThemeColors } from '../../hooks/useThemeColors'
import {
  quickScanPorts,
  customScanPorts,
  rangeScanPorts,
  getSystemInfo,
  checkDocker,
  type PortInfo,
  type SystemInfo,
  type DockerInfo,
} from '../../services/scannerService'

const { TextArea } = Input

type ScanMode = 'quick' | 'custom' | 'range'

export function ScannerPanel() {
  const selectedNodeId = useUIStore((s) => s.selectedNodeId)
  const closePanel = useUIStore((s) => s.closePanel)
  const nodes = useTopologyStore((s) => s.nodes)
  const colors = useThemeColors()

  const node = nodes.find((n) => n.id === selectedNodeId)
  if (!node || !node.ip) {
    return (
      <div style={{ padding: 12, color: colors.textSecondary, fontSize: 12 }}>
        <p>请先选择有 IP 地址的节点</p>
        <Button size="small" onClick={closePanel}>关闭</Button>
      </div>
    )
  }

  const currentNode = node
  const sshInfo = node.ssh
  const targetIp = node.ip
  const sshPort = sshInfo?.port || 22
  const username = sshInfo?.username || ''
  const password = sshInfo?.password || ''
  const privateKey = sshInfo?.privateKey || ''

  const [scanMode, setScanMode] = useState<ScanMode>('quick')
  const [customPorts, setCustomPorts] = useState('')
  const [rangeStart, setRangeStart] = useState(1)
  const [rangeEnd, setRangeEnd] = useState(1024)
  const [timeout, setTimeout] = useState(2)
  const [scanning, setScanning] = useState(false)
  const [scanResults, setScanResults] = useState<PortInfo[]>([])
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [dockerInfo, setDockerInfo] = useState<DockerInfo | null>(null)
  const [loadingSystem, setLoadingSystem] = useState(false)
  const [loadingDocker, setLoadingDocker] = useState(false)

  async function handleScan() {
    setScanning(true)
    try {
      let results: PortInfo[]
      if (scanMode === 'quick') {
        results = await quickScanPorts(targetIp, timeout)
      } else if (scanMode === 'custom') {
        const ports = customPorts
          .split(/[,\s]+/)
          .map((p) => parseInt(p.trim(), 10))
          .filter((p) => !isNaN(p) && p > 0 && p <= 65535)
        if (ports.length === 0) {
          message.warning('请输入有效的端口号')
          setScanning(false)
          return
        }
        results = await customScanPorts(targetIp, ports, timeout)
      } else {
        results = await rangeScanPorts(targetIp, rangeStart, rangeEnd, timeout)
      }
      setScanResults(results)
      message.success(`扫描完成，发现 ${results.filter((p) => p.open).length} 个开放端口`)
    } catch (e) {
      message.error('扫描失败')
    } finally {
      setScanning(false)
    }
  }

  async function handleGetSystemInfo() {
    if (!username) {
      message.warning('请先配置 SSH 用户名')
      return
    }
    setLoadingSystem(true)
    try {
      const info = await getSystemInfo(targetIp, sshPort, username, password, privateKey)
      setSystemInfo(info)
    } catch (e) {
      message.error('获取系统信息失败')
    } finally {
      setLoadingSystem(false)
    }
  }

  async function handleCheckDocker() {
    if (!username) {
      message.warning('请先配置 SSH 用户名')
      return
    }
    setLoadingDocker(true)
    try {
      const info = await checkDocker(targetIp, sshPort, username, password, privateKey)
      setDockerInfo(info)
      if (!info.installed) {
        message.info('未检测到 Docker')
      }
    } catch (e) {
      message.error('检测 Docker 失败')
    } finally {
      setLoadingDocker(false)
    }
  }

  const portColumns = [
    {
      title: '端口',
      dataIndex: 'port',
      key: 'port',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'open',
      key: 'open',
      width: 80,
      render: (open: boolean) => (
        <Tag color={open ? 'green' : 'default'}>{open ? '开放' : '关闭'}</Tag>
      ),
    },
    {
      title: '服务',
      dataIndex: 'service',
      key: 'service',
    },
  ]

  return (
    <div style={{ padding: 12, overflow: 'auto', height: '100%', fontSize: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h4 style={{ margin: 0, fontSize: 13 }}>服务器扫描</h4>
        <Button type="text" size="small" onClick={closePanel}>关闭</Button>
      </div>

      <div style={{ opacity: 0.7, marginBottom: 12, lineHeight: 1.6 }}>
        目标: {currentNode.name} ({targetIp})
      </div>

      <Collapse
        defaultActiveKey={['scan']}
        ghost
        size="small"
        style={{ fontSize: 12 }}
        items={[
          {
            key: 'scan',
            label: '端口扫描',
            children: (
              <div>
                <div style={{ marginBottom: 8 }}>
                  <Select
                    value={scanMode}
                    onChange={setScanMode}
                    style={{ width: '100%', marginBottom: 8 }}
                    size="small"
                    options={[
                      { label: '快速扫描 (常用端口)', value: 'quick' },
                      { label: '自定义端口', value: 'custom' },
                      { label: '端口范围', value: 'range' },
                    ]}
                  />

                  {scanMode === 'custom' && (
                    <Input
                      size="small"
                      value={customPorts}
                      onChange={(e) => setCustomPorts(e.target.value)}
                      placeholder="输入端口，逗号分隔，如: 22,80,443"
                      style={{ marginBottom: 8 }}
                    />
                  )}

                  {scanMode === 'range' && (
                    <Space size="small" style={{ marginBottom: 8, width: '100%' }}>
                      <InputNumber
                        size="small"
                        value={rangeStart}
                        onChange={(v) => setRangeStart(v || 1)}
                        min={1}
                        max={65535}
                        style={{ width: 100 }}
                        placeholder="起始端口"
                      />
                      <span>-</span>
                      <InputNumber
                        size="small"
                        value={rangeEnd}
                        onChange={(v) => setRangeEnd(v || 1024)}
                        min={1}
                        max={65535}
                        style={{ width: 100 }}
                        placeholder="结束端口"
                      />
                    </Space>
                  )}

                  <div style={{ marginBottom: 8 }}>
                    <span style={{ marginRight: 8 }}>超时 (秒):</span>
                    <InputNumber
                      size="small"
                      value={timeout}
                      onChange={(v) => setTimeout(v || 2)}
                      min={1}
                      max={10}
                      style={{ width: 60 }}
                    />
                  </div>

                  <Button
                    type="primary"
                    size="small"
                    icon={<ScanOutlined />}
                    onClick={handleScan}
                    loading={scanning}
                    block
                  >
                    开始扫描
                  </Button>
                </div>

                {scanResults.length > 0 && (
                  <Table
                    size="small"
                    columns={portColumns}
                    dataSource={scanResults}
                    rowKey="port"
                    pagination={{ pageSize: 10, size: 'small' }}
                    style={{ fontSize: 11 }}
                  />
                )}
              </div>
            ),
          },
          {
            key: 'system',
            label: '系统信息',
            children: (
              <div>
                <Button
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={handleGetSystemInfo}
                  loading={loadingSystem}
                  block
                  style={{ marginBottom: 8 }}
                >
                  获取系统信息
                </Button>

                {systemInfo && (
                  <div style={{ lineHeight: 1.8 }}>
                    <div><strong>OS:</strong> {systemInfo.os}</div>
                    <div><strong>主机名:</strong> {systemInfo.hostname}</div>
                    <div><strong>内核:</strong> {systemInfo.kernel}</div>
                    <div><strong>CPU:</strong> {systemInfo.cpu}</div>
                    <div><strong>内存:</strong> {systemInfo.memUsed} / {systemInfo.memTotal} ({systemInfo.memPercent.toFixed(1)}%)</div>
                    <div><strong>磁盘:</strong> {systemInfo.diskUsed} / {systemInfo.diskTotal} ({systemInfo.diskPercent.toFixed(1)}%)</div>
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'docker',
            label: (
              <span>
                <DockerOutlined /> Docker
              </span>
            ),
            children: (
              <div>
                <Button
                  size="small"
                  icon={<DockerOutlined />}
                  onClick={handleCheckDocker}
                  loading={loadingDocker}
                  block
                  style={{ marginBottom: 8 }}
                >
                  检测 Docker
                </Button>

                {dockerInfo && (
                  <div>
                    <div style={{ marginBottom: 8 }}>
                      <strong>状态:</strong>{' '}
                      {dockerInfo.installed ? (
                        <Tag color="green">已安装</Tag>
                      ) : (
                        <Tag>未安装</Tag>
                      )}
                    </div>
                    {dockerInfo.installed && (
                      <>
                        <div style={{ marginBottom: 8 }}><strong>版本:</strong> {dockerInfo.version}</div>
                        {dockerInfo.containers.length > 0 && (
                          <div>
                            <strong>容器 ({dockerInfo.containers.length}):</strong>
                            <div style={{ marginTop: 4 }}>
                              {dockerInfo.containers.map((c) => (
                                <div
                                  key={c.id}
                                  style={{
                                    padding: '4px 8px',
                                    marginBottom: 4,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: 4,
                                  }}
                                >
                                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                                  <div style={{ opacity: 0.7, fontSize: 11 }}>
                                    {c.image} · {c.status}
                                  </div>
                                  {c.ports && (
                                    <div style={{ opacity: 0.7, fontSize: 11 }}>
                                      端口: {c.ports}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
