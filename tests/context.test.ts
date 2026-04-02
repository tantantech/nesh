import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

vi.mock('node:fs')

const loadModule = async () => {
  vi.resetModules()
  return import('../src/context.js')
}

describe('detectProject', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns ProjectContext with type "Node.js" for dir with package.json', async () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      return String(p).endsWith('package.json')
    })
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ name: 'my-app', dependencies: { express: '^4.0.0' }, scripts: { dev: 'tsx' } })
    )
    const { detectProject, clearContextCache } = await loadModule()
    clearContextCache()
    const result = detectProject('/test/dir')
    expect(result).not.toBeNull()
    expect(result!.type).toBe('Node.js')
    expect(result!.name).toBe('my-app')
    expect(result!.markers).toContain('package.json')
    expect(typeof result!.summary).toBe('string')
  })

  it('extracts name, first 10 dependency names, first 10 script names from package.json', async () => {
    const deps: Record<string, string> = {}
    const scripts: Record<string, string> = {}
    for (let i = 0; i < 15; i++) {
      deps[`dep-${i}`] = '1.0.0'
      scripts[`script-${i}`] = `cmd-${i}`
    }
    vi.mocked(fs.existsSync).mockImplementation((p) => String(p).endsWith('package.json'))
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ name: 'big-app', dependencies: deps, scripts })
    )
    const { detectProject, clearContextCache } = await loadModule()
    clearContextCache()
    const result = detectProject('/test/dir')
    expect(result).not.toBeNull()
    expect(result!.name).toBe('big-app')
    // summary should contain deps - check it mentions some but not all 15
    expect(result!.summary).toContain('big-app')
  })

  it('returns type "Rust" for dir with Cargo.toml, no name parsing', async () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => String(p).endsWith('Cargo.toml'))
    const { detectProject, clearContextCache } = await loadModule()
    clearContextCache()
    const result = detectProject('/test/dir')
    expect(result).not.toBeNull()
    expect(result!.type).toBe('Rust')
    expect(result!.name).toBeUndefined()
    expect(result!.markers).toContain('Cargo.toml')
  })

  it('returns type "Go" for dir with go.mod', async () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => String(p).endsWith('go.mod'))
    const { detectProject, clearContextCache } = await loadModule()
    clearContextCache()
    const result = detectProject('/test/dir')
    expect(result).not.toBeNull()
    expect(result!.type).toBe('Go')
  })

  it('returns type "Python" for dir with pyproject.toml', async () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => String(p).endsWith('pyproject.toml'))
    const { detectProject, clearContextCache } = await loadModule()
    clearContextCache()
    const result = detectProject('/test/dir')
    expect(result).not.toBeNull()
    expect(result!.type).toBe('Python')
  })

  it('returns type "Python" for dir with requirements.txt', async () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => String(p).endsWith('requirements.txt'))
    const { detectProject, clearContextCache } = await loadModule()
    clearContextCache()
    const result = detectProject('/test/dir')
    expect(result).not.toBeNull()
    expect(result!.type).toBe('Python')
  })

  it('returns null for dir with no marker files', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    const { detectProject, clearContextCache } = await loadModule()
    clearContextCache()
    const result = detectProject('/empty/dir')
    expect(result).toBeNull()
  })

  it('caches result -- second call does not re-scan', async () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => String(p).endsWith('go.mod'))
    const { detectProject, clearContextCache } = await loadModule()
    clearContextCache()
    detectProject('/cached/dir')
    const callCount = vi.mocked(fs.existsSync).mock.calls.length
    detectProject('/cached/dir')
    expect(vi.mocked(fs.existsSync).mock.calls.length).toBe(callCount)
  })

  it('clearContextCache causes next detectProject to re-scan', async () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => String(p).endsWith('go.mod'))
    const { detectProject, clearContextCache } = await loadModule()
    clearContextCache()
    detectProject('/rescan/dir')
    const callCount = vi.mocked(fs.existsSync).mock.calls.length
    clearContextCache()
    detectProject('/rescan/dir')
    expect(vi.mocked(fs.existsSync).mock.calls.length).toBeGreaterThan(callCount)
  })

  it('handles malformed package.json -- returns type "Node.js" but no name/deps', async () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => String(p).endsWith('package.json'))
    vi.mocked(fs.readFileSync).mockReturnValue('not valid json {{{')
    const { detectProject, clearContextCache } = await loadModule()
    clearContextCache()
    const result = detectProject('/bad-json/dir')
    expect(result).not.toBeNull()
    expect(result!.type).toBe('Node.js')
    expect(result!.name).toBeUndefined()
  })

  it('returns primary type "Node.js" with both markers when package.json + docker-compose.yml present', async () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const s = String(p)
      return s.endsWith('package.json') || s.endsWith('docker-compose.yml')
    })
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ name: 'multi-marker' })
    )
    const { detectProject, clearContextCache } = await loadModule()
    clearContextCache()
    const result = detectProject('/multi/dir')
    expect(result).not.toBeNull()
    expect(result!.type).toBe('Node.js')
    expect(result!.markers).toContain('package.json')
    expect(result!.markers).toContain('docker-compose.yml')
  })
})
