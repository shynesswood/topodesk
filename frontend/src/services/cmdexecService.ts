import { ExecuteLocalCommand as WailsExecuteLocalCommand } from '../../wailsjs/go/main/App'

export interface ExecResult {
  success: boolean
  stdout: string
  stderr: string
  exitCode: number
  error?: string
}

export async function executeLocalCommand(command: string): Promise<ExecResult> {
  const result = await WailsExecuteLocalCommand(command)
  return {
    success: result.success,
    stdout: result.stdout,
    stderr: result.stderr,
    exitCode: result.exitCode,
    error: result.error,
  }
}
