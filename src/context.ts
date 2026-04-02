import fs from 'node:fs'
import path from 'node:path'

export interface ProjectContext {
  readonly type: string
  readonly name?: string
  readonly markers: readonly string[]
  readonly summary: string
}

interface MarkerDef {
  readonly file: string
  readonly type: string
}

const MARKERS: readonly MarkerDef[] = [
  { file: 'package.json', type: 'Node.js' },
  { file: 'Cargo.toml', type: 'Rust' },
  { file: 'go.mod', type: 'Go' },
  { file: 'pyproject.toml', type: 'Python' },
  { file: 'requirements.txt', type: 'Python' },
  { file: 'Gemfile', type: 'Ruby' },
  { file: 'pom.xml', type: 'Java' },
  { file: 'build.gradle', type: 'Java' },
  { file: 'Makefile', type: 'C/C++' },
  { file: 'docker-compose.yml', type: 'Docker' },
]

const contextCache = new Map<string, ProjectContext | null>()

interface PackageJsonInfo {
  readonly name?: string
  readonly scripts?: readonly string[]
  readonly deps?: readonly string[]
}

function readPackageJson(cwd: string): PackageJsonInfo | null {
  try {
    const raw = fs.readFileSync(path.join(cwd, 'package.json'), 'utf-8')
    const parsed: unknown = JSON.parse(raw)

    if (typeof parsed !== 'object' || parsed === null) return null

    const obj = parsed as Record<string, unknown>
    const name = typeof obj.name === 'string' ? obj.name : undefined
    const scripts = typeof obj.scripts === 'object' && obj.scripts !== null
      ? Object.keys(obj.scripts as Record<string, unknown>).slice(0, 10)
      : undefined
    const deps = typeof obj.dependencies === 'object' && obj.dependencies !== null
      ? Object.keys(obj.dependencies as Record<string, unknown>).slice(0, 10)
      : undefined

    return { name, scripts, deps }
  } catch {
    return null
  }
}

function buildSummary(type: string, pkgInfo: PackageJsonInfo | null): string {
  const parts: string[] = [`You are in a ${type} project`]

  if (pkgInfo?.name) {
    parts[0] = `You are in a ${type} project called ${pkgInfo.name}`
  }

  if (pkgInfo?.deps && pkgInfo.deps.length > 0) {
    parts.push(`Key deps: ${pkgInfo.deps.join(', ')}`)
  }

  return parts.join('. ') + '.'
}

export function detectProject(cwd: string): ProjectContext | null {
  if (contextCache.has(cwd)) {
    return contextCache.get(cwd) ?? null
  }

  const foundMarkers: string[] = []
  let primaryType: string | undefined

  for (const marker of MARKERS) {
    if (fs.existsSync(path.join(cwd, marker.file))) {
      foundMarkers.push(marker.file)
      if (primaryType === undefined) {
        primaryType = marker.type
      }
    }
  }

  if (foundMarkers.length === 0 || primaryType === undefined) {
    contextCache.set(cwd, null)
    return null
  }

  const pkgInfo = foundMarkers.includes('package.json')
    ? readPackageJson(cwd)
    : null

  const result: ProjectContext = {
    type: primaryType,
    ...(pkgInfo?.name ? { name: pkgInfo.name } : {}),
    markers: foundMarkers,
    summary: buildSummary(primaryType, pkgInfo),
  }

  contextCache.set(cwd, result)
  return result
}

export function clearContextCache(): void {
  contextCache.clear()
}
