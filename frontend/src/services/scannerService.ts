import {
  ScannerQuickScanPorts as WailsQuickScanPorts,
  ScannerCustomScanPorts as WailsCustomScanPorts,
  ScannerRangeScanPorts as WailsRangeScanPorts,
  ScannerGetSystemInfo as WailsGetSystemInfo,
  ScannerCheckDocker as WailsCheckDocker,
} from '../../wailsjs/go/main/App'

export interface PortInfo {
  port: number
  open: boolean
  service: string
}

export interface SystemInfo {
  os: string
  hostname: string
  kernel: string
  cpu: string
  memTotal: string
  memUsed: string
  memPercent: number
  diskTotal: string
  diskUsed: string
  diskPercent: number
}

export interface ContainerInfo {
  id: string
  name: string
  image: string
  status: string
  ports: string
}

export interface DockerInfo {
  installed: boolean
  version: string
  containers: ContainerInfo[]
}

export async function quickScanPorts(host: string, timeout: number = 2): Promise<PortInfo[]> {
  return WailsQuickScanPorts(host, timeout)
}

export async function customScanPorts(host: string, ports: number[], timeout: number = 2): Promise<PortInfo[]> {
  return WailsCustomScanPorts(host, ports, timeout)
}

export async function rangeScanPorts(host: string, startPort: number, endPort: number, timeout: number = 1): Promise<PortInfo[]> {
  return WailsRangeScanPorts(host, startPort, endPort, timeout)
}

export async function getSystemInfo(
  host: string,
  port: number,
  username: string,
  password: string,
  privateKey: string
): Promise<SystemInfo> {
  return WailsGetSystemInfo(host, port, username, password, privateKey)
}

export async function checkDocker(
  host: string,
  port: number,
  username: string,
  password: string,
  privateKey: string
): Promise<DockerInfo> {
  return WailsCheckDocker(host, port, username, password, privateKey)
}
