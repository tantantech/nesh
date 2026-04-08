import type { PluginRegistry } from './plugins/registry.js'

// Builtins must never be shadowed by aliases
const PROTECTED_BUILTINS: ReadonlySet<string> = new Set(['cd', 'exit', 'quit', 'clear', 'export', 'settings'])

export function expandAlias(input: string, registry: PluginRegistry, prefix?: string): string {
  const trimmed = input.trim()
  if (!trimmed) return input

  const spaceIndex = trimmed.indexOf(' ')
  const firstWord = spaceIndex === -1 ? trimmed : trimmed.slice(0, spaceIndex)
  const rest = spaceIndex === -1 ? '' : trimmed.slice(spaceIndex)

  // Never expand the AI prefix — it must reach classifyInput intact
  if (prefix && firstWord === prefix) return input

  // Never expand shell builtins — they must reach classifyInput intact
  if (PROTECTED_BUILTINS.has(firstWord)) return input

  const expansion = registry.resolve(firstWord)
  if (expansion === undefined) return input

  return expansion + rest
}
