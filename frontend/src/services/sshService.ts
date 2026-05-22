import { SSHTestConnection as WailsSSHTestConnection, SSHExecuteCommand as WailsSSHExecuteCommand } from '../../wailsjs/go/main/App'

export interface SSHTestResult {
  success: boolean
  message: string
}

export interface SSHExecResult {
  success: boolean
  stdout: string
  stderr: string
  exitCode: number
  error?: string
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

export async function executeCommand(
  host: string,
  port: number,
  username: string,
  password: string,
  privateKey: string,
  command: string
): Promise<SSHExecResult> {
  const result = await WailsSSHExecuteCommand(host, port, username, password, privateKey, command)
  return {
    success: result.success,
    stdout: result.stdout,
    stderr: result.stderr,
    exitCode: result.exitCode,
    error: result.error,
  }
}
