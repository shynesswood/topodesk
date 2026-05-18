import { SSHTestConnection as WailsSSHTestConnection } from '../../wailsjs/go/main/App'

export interface SSHTestResult {
  success: boolean
  message: string
}

export async function testConnection(
  host: string,
  port: number,
  username: string,
  password: string,
  privateKey: string
): Promise<SSHTestResult> {
  const result = await WailsSSHTestConnection(host, port, username, password, privateKey)
  return {
    success: result.success,
    message: result.message,
  }
}
