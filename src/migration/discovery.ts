import pc from 'picocolors'
import { PLUGIN_CATALOG } from '../plugins/catalog.js'
import { loadConfig, resolveApiKey } from '../config.js'

export interface PluginRecommendation {
  readonly name: string
  readonly description: string
  readonly reason: string
  readonly category: string
}

export interface DiscoveryResult {
  readonly recommendations: readonly PluginRecommendation[]
  readonly source: 'ai' | 'keyword'
}

function buildCatalogContext(): string {
  return PLUGIN_CATALOG
    .map(e => `${e.name} | ${e.description} | ${e.category}`)
    .join('\n')
}

function buildDiscoveryPrompt(userInput: string): string {
  const catalog = buildCatalogContext()
  return [
    'You are a plugin recommendation engine for Nesh, an AI-native terminal shell.',
    'Given the user\'s description of their workflow, recommend 3-5 plugins from the catalog below.',
    'Return ONLY a JSON array of objects with fields: name, reason (one sentence why it fits).',
    'Example: [{"name":"git","reason":"You work with git repositories daily"}]',
    '',
    'Available plugins:',
    'name | description | category',
    catalog,
    '',
    `User workflow: ${userInput}`,
  ].join('\n')
}

function keywordSearch(userInput: string): readonly PluginRecommendation[] {
  const words = userInput.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  if (words.length === 0) return []

  const scored = PLUGIN_CATALOG
    .filter(entry => entry.status !== 'no-equivalent')
    .map(entry => {
      const text = `${entry.name} ${entry.description} ${entry.omzName}`.toLowerCase()
      const matchCount = words.filter(w => text.includes(w)).length
      return { entry, matchCount }
    })
    .filter(({ matchCount }) => matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 5)

  return scored.map(({ entry }) => ({
    name: entry.name,
    description: entry.description,
    reason: `Matches your search keywords`,
    category: entry.category,
  }))
}

function parseAIResponse(
  text: string,
): readonly PluginRecommendation[] {
  try {
    // Extract JSON array from response (may be wrapped in markdown code fences)
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return []

    const parsed: unknown = JSON.parse(jsonMatch[0])
    if (!Array.isArray(parsed)) return []

    const recommendations: PluginRecommendation[] = []
    for (const item of parsed) {
      if (typeof item !== 'object' || item === null) continue
      const obj = item as Record<string, unknown>
      const name = typeof obj.name === 'string' ? obj.name : ''
      const reason = typeof obj.reason === 'string' ? obj.reason : ''

      // Only include plugins that exist in the catalog
      const catalogEntry = PLUGIN_CATALOG.find(e => e.name === name)
      if (!catalogEntry) continue

      recommendations.push({
        name: catalogEntry.name,
        description: catalogEntry.description,
        reason,
        category: catalogEntry.category,
      })
    }

    return recommendations
  } catch {
    return []
  }
}

export async function discoverPlugins(userInput: string): Promise<DiscoveryResult> {
  const config = loadConfig()
  const apiKey = resolveApiKey(config)

  if (!apiKey) {
    return {
      recommendations: keywordSearch(userInput),
      source: 'keyword',
    }
  }

  try {
    const sdk = await import('@anthropic-ai/claude-agent-sdk')
    const prompt = buildDiscoveryPrompt(userInput)

    let responseText = ''

    const stream = sdk.query({
      prompt,
      options: {
        allowedTools: [],
        model: 'claude-3-5-haiku-latest',
        systemPrompt: 'You are a plugin recommendation engine. Return only valid JSON arrays.',
      },
    })

    for await (const message of stream) {
      const msg = message as {
        readonly type: string
        readonly event?: {
          readonly type: string
          readonly delta?: { readonly type: string; readonly text?: string }
        }
      }

      if (
        msg.type === 'stream_event' &&
        msg.event?.type === 'content_block_delta' &&
        msg.event.delta?.type === 'text_delta' &&
        msg.event.delta.text
      ) {
        responseText += msg.event.delta.text
      }
    }

    const recommendations = parseAIResponse(responseText)

    if (recommendations.length === 0) {
      // AI returned nothing useful, fall back to keyword search
      return {
        recommendations: keywordSearch(userInput),
        source: 'keyword',
      }
    }

    return {
      recommendations,
      source: 'ai',
    }
  } catch {
    // AI call failed -- fall back to keyword search silently
    return {
      recommendations: keywordSearch(userInput),
      source: 'keyword',
    }
  }
}

export function formatDiscoveryResults(result: DiscoveryResult): string {
  if (result.recommendations.length === 0) {
    return 'No matching plugins found. Try different keywords.'
  }

  const sourceLabel = result.source === 'ai' ? 'AI-powered' : 'keyword-based'
  const lines: string[] = [
    pc.bold(`Plugin Recommendations (${sourceLabel})`),
    '',
  ]

  for (let i = 0; i < result.recommendations.length; i++) {
    const rec = result.recommendations[i]
    lines.push(`  ${pc.bold(`${i + 1}. ${rec.name}`)} (${rec.category})`)
    lines.push(`     ${rec.description}`)
    lines.push(`     ${pc.dim(rec.reason)}`)
    lines.push(`     ${pc.cyan(`plugin enable ${rec.name}`)}`)
    lines.push('')
  }

  return lines.join('\n')
}
