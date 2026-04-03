import pc from 'picocolors'
import * as readline from 'node:readline/promises'
import { listModels, getProviderForModel, PROVIDER_DISPLAY_NAMES } from './providers/index.js'

// Provider display order grouped by tier
const PROVIDER_TIERS: ReadonlyArray<{ readonly label: string; readonly providers: readonly string[] }> = [
  { label: 'Big Tech',                   providers: ['claude', 'openai', 'google'] },
  { label: 'Major AI Companies',         providers: ['xai', 'deepseek', 'mistral', 'cohere', 'minimax'] },
  { label: 'Fast Inference',             providers: ['groq', 'together', 'fireworks'] },
  { label: 'Aggregators / Local',        providers: ['openrouter', 'ollama', 'perplexity'] },
]

export async function executeModelSwitcher(
  rl: readline.Interface,
  currentModel: string | undefined,
): Promise<string | undefined> {
  const models = listModels()

  // Group models by provider
  const byProvider = new Map<string, typeof models>()
  for (const m of models) {
    const existing = byProvider.get(m.entry.provider) ?? []
    byProvider.set(m.entry.provider, [...existing, m])
  }

  process.stdout.write('\nAvailable models:\n\n')

  let index = 0
  const indexToShorthand: string[] = []

  for (const tier of PROVIDER_TIERS) {
    const tierHasModels = tier.providers.some(p => byProvider.has(p))
    if (!tierHasModels) continue

    process.stdout.write(`  ${pc.dim(`── ${tier.label} ──`)}\n`)

    for (const providerKey of tier.providers) {
      const providerModels = byProvider.get(providerKey)
      if (!providerModels) continue

      const providerLabel = PROVIDER_DISPLAY_NAMES[providerKey] ?? providerKey
      process.stdout.write(`  ${pc.bold(providerLabel)}\n`)

      for (const { shorthand, entry } of providerModels) {
        index++
        indexToShorthand.push(shorthand)
        const isCurrent = currentModel === entry.model || currentModel === shorthand
        const marker = isCurrent ? pc.green(' *') : '  '
        process.stdout.write(`    [${index}] ${entry.displayName}${marker}\n`)
      }
    }
    process.stdout.write('\n')
  }

  // Show any providers not in tiers (future-proofing)
  const tieredProviders = new Set(PROVIDER_TIERS.flatMap(t => t.providers))
  for (const [providerKey, providerModels] of byProvider) {
    if (tieredProviders.has(providerKey)) continue
    const providerLabel = PROVIDER_DISPLAY_NAMES[providerKey] ?? providerKey
    process.stdout.write(`  ${pc.bold(providerLabel)}\n`)
    for (const { shorthand, entry } of providerModels) {
      index++
      indexToShorthand.push(shorthand)
      const isCurrent = currentModel === entry.model || currentModel === shorthand
      const marker = isCurrent ? pc.green(' *') : '  '
      process.stdout.write(`    [${index}] ${entry.displayName}${marker}\n`)
    }
    process.stdout.write('\n')
  }

  const answer = await rl.question(`Select model (1-${index}): `)
  const num = parseInt(answer.trim(), 10)

  if (isNaN(num) || num < 1 || num > index) {
    process.stdout.write('Selection cancelled.\n')
    return undefined
  }

  const selectedShorthand = indexToShorthand[num - 1]
  const resolved = getProviderForModel(selectedShorthand)
  if (!resolved) return undefined

  process.stderr.write(pc.dim(`Model set to ${resolved.displayName}\n`))
  return resolved.modelId
}

export function getModelDisplayName(modelId: string | undefined): string {
  if (!modelId) return 'Claude Sonnet 4.5'
  const resolved = getProviderForModel(modelId)
  return resolved?.displayName ?? modelId
}
