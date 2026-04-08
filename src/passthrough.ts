import { spawn } from 'node:child_process'

export interface CommandResult {
  readonly exitCode: number
  readonly stderr: string
}

export function executeCommand(command: string, cwd?: string, lastExitCode?: number): Promise<CommandResult> {
  return new Promise((resolve) => {
    // Inject previous exit code so $? works correctly across commands
    const wrappedCommand = lastExitCode !== undefined
      ? `(exit ${lastExitCode}); ${command}`
      : command
    const child = spawn('bash', ['-c', wrappedCommand], {
      stdio: ['inherit', 'inherit', 'pipe'],
      cwd: cwd ?? process.cwd(),
      env: process.env,
    })

    const stderrChunks: Buffer[] = []
    child.stderr?.on('data', (chunk: Buffer) => {
      stderrChunks.push(chunk)
      process.stderr.write(chunk)
    })

    child.on('close', (code) => {
      resolve({
        exitCode: code ?? 1,
        stderr: Buffer.concat(stderrChunks).toString('utf-8'),
      })
    })

    child.on('error', (err) => {
      resolve({
        exitCode: 127,
        stderr: err.message,
      })
    })
  })
}
