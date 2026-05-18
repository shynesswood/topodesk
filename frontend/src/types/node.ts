export interface SoftwareInfo {
  name: string
  installPath?: string
  dataPath?: string
  logPath?: string
  startCommand?: string
  stopCommand?: string
  restartCommand?: string
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

  position: {
    x: number
    y: number
  }

  ssh?: SSHInfo
  software?: SoftwareInfo[]
}
