import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('node:fs')
vi.mock('node:os', () => ({
  default: { homedir: () => '/mock-home' },
  homedir: () => '/mock-home',
}))

describe('provider registry', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('resolveModel returns entry for known shorthand', async () => {
    const { resolveModel } = await import('../src/providers/registry.js')
    const entry = resolveModel('gpt-4o')
    expect(entry).toEqual({
      provider: 'openai',
      model: 'gpt-4o',
      displayName: 'GPT-4o',
    })
  })

  it('resolveModel returns undefined for unknown shorthand', async () => {
    const { resolveModel } = await import('../src/providers/registry.js')
    expect(resolveModel('unknown-model')).toBeUndefined()
  })

  it('listModels returns all registered models', async () => {
    const { listModels } = await import('../src/providers/registry.js')
    const models = listModels()
    expect(models.length).toBeGreaterThanOrEqual(29)
    const shorthands = models.map(m => m.shorthand)
    expect(shorthands).toContain('claude-opus')
    expect(shorthands).toContain('gpt-4o')
    expect(shorthands).toContain('gemini-pro')
    // Tier 2+ providers
    expect(shorthands).toContain('grok-4')
    expect(shorthands).toContain('deepseek-chat')
    expect(shorthands).toContain('mistral-large')
    expect(shorthands).toContain('llama-3.3-70b')
    expect(shorthands).toContain('sonar-pro')
  })

  it('getProviderForModel resolves shorthand to provider info', async () => {
    const { getProviderForModel } = await import('../src/providers/registry.js')
    const result = getProviderForModel('gemini-pro')
    expect(result).toEqual({
      providerName: 'google',
      modelId: 'gemini-2.5-pro',
      displayName: 'Gemini 2.5 Pro',
    })
  })

  it('getProviderForModel resolves full model ID to provider info', async () => {
    const { getProviderForModel } = await import('../src/providers/registry.js')
    const result = getProviderForModel('claude-opus-4-6-20250414')
    expect(result).toEqual({
      providerName: 'claude',
      modelId: 'claude-opus-4-6-20250414',
      displayName: 'Claude Opus 4.6',
    })
  })

  it('getProviderForModel returns undefined for unknown model', async () => {
    const { getProviderForModel } = await import('../src/providers/registry.js')
    expect(getProviderForModel('nonexistent')).toBeUndefined()
  })

  it('getProvider throws for unknown provider', async () => {
    const { getProvider } = await import('../src/providers/registry.js')
    await expect(getProvider('nonexistent')).rejects.toThrow('Unknown provider: nonexistent')
  })

  it('MODEL_REGISTRY contains all expected providers', async () => {
    const { MODEL_REGISTRY } = await import('../src/providers/registry.js')
    const providers = new Set(Object.values(MODEL_REGISTRY).map(e => e.provider))
    expect(providers).toContain('claude')
    expect(providers).toContain('openai')
    expect(providers).toContain('google')
    expect(providers).toContain('xai')
    expect(providers).toContain('deepseek')
    expect(providers).toContain('mistral')
    expect(providers).toContain('cohere')
    expect(providers).toContain('minimax')
    expect(providers).toContain('groq')
    expect(providers).toContain('together')
    expect(providers).toContain('fireworks')
    expect(providers).toContain('perplexity')
  })

  it('PROVIDER_ENV_VARS maps all providers with keys', async () => {
    const { PROVIDER_ENV_VARS } = await import('../src/providers/registry.js')
    expect(PROVIDER_ENV_VARS.claude).toBe('ANTHROPIC_API_KEY')
    expect(PROVIDER_ENV_VARS.openai).toBe('OPENAI_API_KEY')
    expect(PROVIDER_ENV_VARS.google).toBe('GOOGLE_API_KEY')
    expect(PROVIDER_ENV_VARS.xai).toBe('XAI_API_KEY')
    expect(PROVIDER_ENV_VARS.deepseek).toBe('DEEPSEEK_API_KEY')
    expect(PROVIDER_ENV_VARS.groq).toBe('GROQ_API_KEY')
    expect(PROVIDER_ENV_VARS.openrouter).toBe('OPENROUTER_API_KEY')
    // Ollama has no key — should not be in PROVIDER_ENV_VARS
    expect(PROVIDER_ENV_VARS.ollama).toBeUndefined()
  })

  it('PROVIDER_CONFIGS contains all 16 providers', async () => {
    const { PROVIDER_CONFIGS } = await import('../src/providers/registry.js')
    const names = Object.keys(PROVIDER_CONFIGS)
    expect(names.length).toBe(15)
    expect(names).toContain('claude')
    expect(names).toContain('ollama')
    expect(names).toContain('openrouter')
  })

  it('PROVIDER_CONFIGS has correct types for each provider', async () => {
    const { PROVIDER_CONFIGS } = await import('../src/providers/registry.js')
    expect(PROVIDER_CONFIGS.claude.type).toBe('claude')
    expect(PROVIDER_CONFIGS.google.type).toBe('gemini')
    expect(PROVIDER_CONFIGS.groq.type).toBe('openai-compatible')
    expect(PROVIDER_CONFIGS.xai.type).toBe('openai-compatible')
    expect(PROVIDER_CONFIGS.ollama.type).toBe('openai-compatible')
    expect(PROVIDER_CONFIGS.ollama.apiKeyEnv).toBe('')
  })

  it('getProvider resolves OpenAI-compatible providers via config type', async () => {
    const { PROVIDER_CONFIGS } = await import('../src/providers/registry.js')
    // Verify all openai-compatible providers have baseURL set (except azure)
    const compatibleProviders = Object.values(PROVIDER_CONFIGS).filter(
      c => c.type === 'openai-compatible' && c.name !== 'azure'
    )
    for (const p of compatibleProviders) {
      expect(p.baseURL).toBeTruthy()
    }
  })
})

describe('key management', () => {
  const ENV_VARS_TO_SAVE = [
    'ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'GOOGLE_API_KEY',
    'XAI_API_KEY', 'DEEPSEEK_API_KEY', 'GROQ_API_KEY', 'OPENROUTER_API_KEY',
  ]
  const originalEnv: Record<string, string | undefined> = {}

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
    for (const v of ENV_VARS_TO_SAVE) {
      originalEnv[v] = process.env[v]
      delete process.env[v]
    }
  })

  afterEach(() => {
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value !== undefined) {
        process.env[key] = value
      } else {
        delete process.env[key]
      }
    }
  })

  it('resolveProviderKey returns config key when set', async () => {
    const fs = await import('node:fs')
    vi.mocked(fs.default.readFileSync).mockReturnValue(
      JSON.stringify({ keys: { openai: 'sk-test-openai' } })
    )
    const { resolveProviderKey } = await import('../src/config.js')
    expect(resolveProviderKey('openai')).toBe('sk-test-openai')
  })

  it('resolveProviderKey falls back to env var', async () => {
    const fs = await import('node:fs')
    vi.mocked(fs.default.readFileSync).mockReturnValue(JSON.stringify({}))
    process.env.OPENAI_API_KEY = 'sk-env-openai'
    const { resolveProviderKey } = await import('../src/config.js')
    expect(resolveProviderKey('openai')).toBe('sk-env-openai')
  })

  it('resolveProviderKey returns undefined when no key configured', async () => {
    const fs = await import('node:fs')
    vi.mocked(fs.default.readFileSync).mockReturnValue(JSON.stringify({}))
    const { resolveProviderKey } = await import('../src/config.js')
    expect(resolveProviderKey('openai')).toBeUndefined()
  })

  it('maskKey masks keys correctly', async () => {
    const fs = await import('node:fs')
    vi.mocked(fs.default.readFileSync).mockImplementation(() => {
      const err = new Error('ENOENT') as NodeJS.ErrnoException
      err.code = 'ENOENT'
      throw err
    })
    const { maskKey } = await import('../src/config.js')
    expect(maskKey('sk-ant-api03-abcdef123456')).toBe('sk-a...3456')
    expect(maskKey('short')).toBe('****')
    expect(maskKey('12345678')).toBe('****')
    expect(maskKey('123456789')).toBe('1234...6789')
  })

  it('resolveApiKey still checks env first for backward compat', async () => {
    const fs = await import('node:fs')
    vi.mocked(fs.default.readFileSync).mockReturnValue(
      JSON.stringify({ api_key: 'sk-config', keys: { anthropic: 'sk-keys' } })
    )
    process.env.ANTHROPIC_API_KEY = 'sk-env'
    const { resolveApiKey, loadConfig } = await import('../src/config.js')
    const config = loadConfig()
    expect(resolveApiKey(config)).toBe('sk-env')
  })

  it('resolveApiKey falls back to keys.anthropic', async () => {
    const fs = await import('node:fs')
    vi.mocked(fs.default.readFileSync).mockReturnValue(
      JSON.stringify({ keys: { anthropic: 'sk-from-keys' } })
    )
    const { resolveApiKey, loadConfig } = await import('../src/config.js')
    const config = loadConfig()
    expect(resolveApiKey(config)).toBe('sk-from-keys')
  })

  it('resolveProviderKey resolves new provider env vars', async () => {
    const fs = await import('node:fs')
    vi.mocked(fs.default.readFileSync).mockReturnValue(JSON.stringify({}))
    process.env.GROQ_API_KEY = 'gsk-test-groq'
    process.env.XAI_API_KEY = 'xai-test-key'
    const { resolveProviderKey } = await import('../src/config.js')
    expect(resolveProviderKey('groq')).toBe('gsk-test-groq')
    expect(resolveProviderKey('xai')).toBe('xai-test-key')
    expect(resolveProviderKey('deepseek')).toBeUndefined()
  })

  it('resolveProviderKey prefers config key over env var for new providers', async () => {
    const fs = await import('node:fs')
    vi.mocked(fs.default.readFileSync).mockReturnValue(
      JSON.stringify({ keys: { groq: 'gsk-config-key' } })
    )
    process.env.GROQ_API_KEY = 'gsk-env-key'
    const { resolveProviderKey } = await import('../src/config.js')
    expect(resolveProviderKey('groq')).toBe('gsk-config-key')
  })
})

describe('classify with --model flag', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('parses --model gpt-4o flag and resolves to full model ID', async () => {
    const { classifyInput } = await import('../src/classify.js')
    const result = classifyInput('a --model gpt-4o what is rust')
    expect(result).toEqual({
      type: 'ai',
      prompt: 'what is rust',
      model: 'gpt-4o',  // gpt-4o shorthand resolves to gpt-4o model ID
    })
  })

  it('parses --model gemini-pro flag', async () => {
    const { classifyInput } = await import('../src/classify.js')
    const result = classifyInput('a --model gemini-pro explain this')
    expect(result).toEqual({
      type: 'ai',
      prompt: 'explain this',
      model: 'gemini-2.5-pro',
    })
  })

  it('parses --model with unknown model passes through as-is', async () => {
    const { classifyInput } = await import('../src/classify.js')
    const result = classifyInput('a --model custom-model hello')
    expect(result).toEqual({
      type: 'ai',
      prompt: 'hello',
      model: 'custom-model',
    })
  })

  it('classifies model as builtin', async () => {
    const { classifyInput } = await import('../src/classify.js')
    expect(classifyInput('model')).toEqual({
      type: 'builtin',
      name: 'model',
      args: '',
    })
  })

  it('classifies keys as builtin', async () => {
    const { classifyInput } = await import('../src/classify.js')
    expect(classifyInput('keys')).toEqual({
      type: 'builtin',
      name: 'keys',
      args: '',
    })
  })
})

describe('model-switcher', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('getModelDisplayName returns display name for known model', async () => {
    const { getModelDisplayName } = await import('../src/model-switcher.js')
    expect(getModelDisplayName('gpt-4o')).toBe('GPT-4o')
  })

  it('getModelDisplayName returns model ID for unknown model', async () => {
    const { getModelDisplayName } = await import('../src/model-switcher.js')
    expect(getModelDisplayName('custom-model')).toBe('custom-model')
  })

  it('getModelDisplayName returns default for undefined', async () => {
    const { getModelDisplayName } = await import('../src/model-switcher.js')
    expect(getModelDisplayName(undefined)).toBe('Claude Sonnet 4.5')
  })
})
