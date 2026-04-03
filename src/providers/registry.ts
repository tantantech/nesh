import type { AIProvider } from './provider.js'

export interface ModelEntry {
  readonly provider: string
  readonly model: string
  readonly displayName: string
}

export const MODEL_REGISTRY: Readonly<Record<string, ModelEntry>> = {
  // Claude models
  'claude-opus': { provider: 'claude', model: 'claude-opus-4-6-20250414', displayName: 'Claude Opus 4.6' },
  'claude-sonnet': { provider: 'claude', model: 'claude-sonnet-4-5-20250514', displayName: 'Claude Sonnet 4.5' },
  'claude-haiku': { provider: 'claude', model: 'claude-haiku-4-5-20251001', displayName: 'Claude Haiku 4.5' },
  // OpenAI models
  'gpt-4o': { provider: 'openai', model: 'gpt-4o', displayName: 'GPT-4o' },
  'gpt-4.5': { provider: 'openai', model: 'gpt-4.5-preview', displayName: 'GPT-4.5' },
  'o3': { provider: 'openai', model: 'o3', displayName: 'OpenAI o3' },
  'o4-mini': { provider: 'openai', model: 'o4-mini', displayName: 'OpenAI o4-mini' },
  // Google models
  'gemini-pro': { provider: 'google', model: 'gemini-2.5-pro', displayName: 'Gemini 2.5 Pro' },
  'gemini-flash': { provider: 'google', model: 'gemini-2.5-flash', displayName: 'Gemini 2.5 Flash' },
}

// Maps provider name to env var for API key resolution
export const PROVIDER_ENV_VARS: Readonly<Record<string, string>> = {
  claude: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
  google: 'GOOGLE_API_KEY',
}

// Provider display names for UI
export const PROVIDER_DISPLAY_NAMES: Readonly<Record<string, string>> = {
  claude: 'Anthropic',
  openai: 'OpenAI',
  google: 'Google',
}

// Lazy-loaded provider instances
const providerCache: Map<string, AIProvider> = new Map()

export async function getProvider(providerName: string): Promise<AIProvider> {
  const cached = providerCache.get(providerName)
  if (cached) return cached

  let provider: AIProvider

  switch (providerName) {
    case 'claude': {
      const { createClaudeProvider } = await import('./claude.js')
      provider = createClaudeProvider()
      break
    }
    case 'openai': {
      const { createOpenAIProvider } = await import('./openai.js')
      provider = createOpenAIProvider()
      break
    }
    case 'google': {
      const { createGeminiProvider } = await import('./gemini.js')
      provider = createGeminiProvider()
      break
    }
    default:
      throw new Error(`Unknown provider: ${providerName}`)
  }

  providerCache.set(providerName, provider)
  return provider
}

export function resolveModel(shorthand: string): ModelEntry | undefined {
  return MODEL_REGISTRY[shorthand]
}

export function listModels(): ReadonlyArray<{ readonly shorthand: string; readonly entry: ModelEntry }> {
  return Object.entries(MODEL_REGISTRY).map(([shorthand, entry]) => ({
    shorthand,
    entry,
  }))
}

export function getProviderForModel(modelId: string): { readonly providerName: string; readonly modelId: string; readonly displayName: string } | undefined {
  // Check if it's a shorthand
  const entry = MODEL_REGISTRY[modelId]
  if (entry) {
    return { providerName: entry.provider, modelId: entry.model, displayName: entry.displayName }
  }

  // Check if it's a full model ID (e.g., claude-opus-4-6-20250414)
  for (const [, e] of Object.entries(MODEL_REGISTRY)) {
    if (e.model === modelId) {
      return { providerName: e.provider, modelId: e.model, displayName: e.displayName }
    }
  }

  return undefined
}
