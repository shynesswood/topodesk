import { RDPTestConnection as WailsRDPTestConnection } from '../../wailsjs/go/main/App'

export interface RDPTestResult {
  success: boolean
  message: string
}

export async function testConnection(
  host: string,
  port: number,
  username: string,
  password: string,
  domain: string
): Promise<RDPTestResult> {
  const result = await WailsRDPTestConnection(host, port, username, password, domain)
  return {
    success: result.success,
    message: result.message,
  }
}
