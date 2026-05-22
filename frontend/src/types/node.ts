export type OSType = 'linux' | 'windows'

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

export interface RDPInfo {
  username?: string
  password?: string
  domain?: string
  port?: number
}

export interface TopologyNode {
  id: string
  name: string
  ip?: string
  description?: string
  os?: OSType

  position: {
    x: number
    y: number
  }

  ssh?: SSHInfo
  rdp?: RDPInfo
  software?: SoftwareInfo[]
}
