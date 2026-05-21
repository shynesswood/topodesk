export interface SoftwareInfo {
  name: string
  props?: Record<string, string>
}

export interface SSHInfo {
  username?: string
  password?: string
  privateKey?: string
  port?: number
}

export interface TopologyNode {
  id: string
  name: string
  ip?: string
  description?: string
  tags?: string[]

  position: {
    x: number
    y: number
  }

  ssh?: SSHInfo
  software?: SoftwareInfo[]
}
