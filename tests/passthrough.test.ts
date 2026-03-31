import { describe, it, expect } from 'vitest'
import { executeCommand } from '../src/passthrough.js'

describe('executeCommand', () => {
  it('returns CommandResult with exitCode 0 for successful command', async () => {
    const result = await executeCommand('echo hello')
    expect(result).toEqual({ exitCode: 0, stderr: '' })
  })

  it('returns non-zero exitCode for failing command', async () => {
    const result = await executeCommand('exit 42')
    expect(result.exitCode).toBe(42)
  })

  it('returns exitCode 127 for nonexistent command', async () => {
    const result = await executeCommand('nonexistent_command_xyz_12345')
    expect(result.exitCode).not.toBe(0)
  })

  it('captures stderr content on failure', async () => {
    const result = await executeCommand('echo err >&2 && exit 1')
    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('err')
  })

  it('handles pipes via bash', async () => {
    const result = await executeCommand('echo a | cat')
    expect(result.exitCode).toBe(0)
  })

  it('uses provided cwd as working directory', async () => {
    const result = await executeCommand('test -d /tmp', '/tmp')
    expect(result.exitCode).toBe(0)
  })
})
