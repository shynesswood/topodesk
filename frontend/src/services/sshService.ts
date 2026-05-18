import {
  SSHTestConnection as WailsSSHTestConnection,
  SSHExecuteCommand as WailsSSHExecuteCommand,
  SSHReadFile as WailsSSHReadFile,
  SSHReadLargeFile as WailsSSHReadLargeFile,
} from '../../wailsjs/go/main/App'
import { ssh } from '../../wailsjs/go/models'

export interface SSHTestResult {
  success: boolean
  message: string
}

export interface SSHCommandResult {
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
  command: string,
  timeout: number = 30
): Promise<SSHCommandResult> {
  const result = await WailsSSHExecuteCommand(host, port, username, password, privateKey, command, timeout)
  return {
    stdout: result.stdout,
    stderr: result.stderr,
    exitCode: result.exitCode,
    error: result.error,
  }
}

export async function readFile(
  host: string,
  port: number,
  username: string,
  password: string,
  privateKey: string,
  filePath: string
): Promise<string> {
  return WailsSSHReadFile(host, port, username, password, privateKey, filePath)
}

export async function readLargeFile(
  host: string,
  port: number,
  username: string,
  password: string,
  privateKey: string,
  filePath: string,
  maxLines: number = 100
): Promise<string> {
  return WailsSSHReadLargeFile(host, port, username, password, privateKey, filePath, maxLines)
}
