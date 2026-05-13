export interface SoftwareInfo {
  name: string
  installPath?: string
  startCommand?: string
  logPath?: string
  configPath?: string
}

export interface SSHInfo {
  username?: string
  password?: string
  privateKey?: string
  port?: number
}

export interface TopologyNode {
  id: string
  type: string
  name: string
  ip?: string
  port?: number

  position: {
    x: number
    y: number
  }

  ssh?: SSHInfo
  software?: SoftwareInfo[]
  tags?: string[]

  metadata?: Record<string, string>
}

export const NODE_TYPES = [
  'Server',
  'Database',
  'Redis',
  'MQ',
  'Gateway',
  'API',
  'External Service',
] as const

export type NodeType = (typeof NODE_TYPES)[number]
