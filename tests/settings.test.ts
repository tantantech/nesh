import { describe, it, expect, vi, beforeEach } from 'vitest'
import type * as readline from 'node:readline/promises'

// Mock dependencies before importing
vi.mock('../src/wizard.js', () => ({
  executeWizard: vi.fn(),
}))
vi.mock('../src/prompt-config.js', () => ({
  executePromptConfig: vi.fn(),
  COLOR_SCHEMES: [
    { name: 'default', label: 'Default', description: 'Default colors' },
  ],
}))
vi.mock('../src/model-switcher.js', () => ({
  executeModelSwitcher: vi.fn(),
}))
vi.mock('../src/key-manager.js', () => ({
  executeKeyManager: vi.fn(),
}))
vi.mock('../src/config.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/config.js')>()
  return {
    ...actual,
    CONFIG_DIR: '/mock/.nesh',
    loadConfig: vi.fn(() => ({
      prefix: 'a',
      permissions: 'ask',
      history_size: 1000,
    })),
    saveConfig: vi.fn(),
  }
})
vi.mock('../src/templates.js', () => ({
  TEMPLATES: [
    { name: 'minimal', label: 'Minimal', description: 'Simple prompt', requiresNerdFont: false },
  ],
}))
vi.mock('../src/plugins/index.js', () => ({
  BUNDLED_PLUGINS: [],
  PLUGIN_CATALOG_LIST: [],
}))
vi.mock('../src/plugins/profiles.js', () => ({
  PROFILES: [],
  expandProfile: vi.fn(),
}))
vi.mock('../src/plugin-install.js', () => ({
  installPlugin: vi.fn(),
  removePlugin: vi.fn(),
}))
vi.mock('../src/plugin-reload.js', () => ({
  hotReload: vi.fn(),
}))
vi.mock('../src/menu.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/menu.js')>()
  return {
    ...actual,
  }
})

import { executeSettings } from '../src/settings.js'
import { executeModelSwitcher } from '../src/model-switcher.js'
import { executeKeyManager } from '../src/key-manager.js'
import { loadConfig, saveConfig } from '../src/config.js'

function createMockRl(answers: string[]): readline.Interface {
  let callIndex = 0
  return {
    question: vi.fn(async () => {
      const answer = answers[callIndex] ?? ''
      callIndex++
      return answer
    }),
  } as unknown as readline.Interface
}

describe('executeSettings', () => {
  let stdoutOutput: string

  beforeEach(() => {
    vi.clearAllMocks()
    stdoutOutput = ''
    vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
      stdoutOutput += String(chunk)
      return true
    })
    vi.mocked(loadConfig).mockReturnValue({
      prefix: 'a',
      permissions: 'ask',
      history_size: 1000,
    })
  })

  it('displays main menu with 4 categories', async () => {
    // 'q' quits immediately
    const rl = createMockRl(['q'])
    await executeSettings(rl, {})

    expect(stdoutOutput).toContain('Nesh Settings')
    expect(stdoutOutput).toContain('[1]')
    expect(stdoutOutput).toContain('[2]')
    expect(stdoutOutput).toContain('[3]')
    expect(stdoutOutput).toContain('[4]')
    expect(stdoutOutput).toContain('Appearance')
    expect(stdoutOutput).toContain('AI')
    expect(stdoutOutput).toContain('Plugins')
    expect(stdoutOutput).toContain('Shell')
  })

  it('returns empty result on quit', async () => {
    const rl = createMockRl(['q'])
    const result = await executeSettings(rl, {})
    expect(result).toEqual({})
  })

  it('returns empty result on empty input then quit', async () => {
    const rl = createMockRl(['', 'q'])
    const result = await executeSettings(rl, {})
    expect(result).toEqual({})
  })

  it('navigates into AI submenu and delegates model selection', async () => {
    vi.mocked(executeModelSwitcher).mockResolvedValue('claude-sonnet-4-5-20250514')
    // Select [2] AI, then [1] Model, then q (exit AI), then q (exit main)
    const rl = createMockRl(['2', '1', 'q', 'q'])
    const result = await executeSettings(rl, { currentModel: 'claude-haiku-4-5-20251001' })

    expect(executeModelSwitcher).toHaveBeenCalledWith(rl, 'claude-haiku-4-5-20251001')
    expect(result).toEqual({ model: 'claude-sonnet-4-5-20250514' })
  })

  it('navigates into AI submenu and delegates key manager', async () => {
    vi.mocked(executeKeyManager).mockResolvedValue(undefined)
    // Select [2] AI, then [2] API Keys, then q (exit AI), then q (exit main)
    const rl = createMockRl(['2', '2', 'q', 'q'])
    const result = await executeSettings(rl, {})

    expect(executeKeyManager).toHaveBeenCalledWith(rl)
    expect(result).toEqual({})
  })

  it('navigates into Shell submenu and updates prefix', async () => {
    // Select [4] Shell, then [1] AI Prefix, type new prefix, then q (exit Shell), then q (exit main)
    const rl = createMockRl(['4', '1', 'hey', 'q', 'q'])
    const result = await executeSettings(rl, {})

    expect(vi.mocked(saveConfig)).toHaveBeenCalledWith(
      expect.objectContaining({ prefix: 'hey' })
    )
    expect(result).toEqual({ prefix: 'hey' })
  })

  it('rejects prefix with whitespace and returns empty', async () => {
    // Select [4] Shell, then [1] AI Prefix, type invalid prefix, then q, then q
    const rl = createMockRl(['4', '1', 'he y', 'q', 'q'])
    const result = await executeSettings(rl, {})

    expect(vi.mocked(saveConfig)).not.toHaveBeenCalled()
    expect(result).toEqual({})
  })

  it('navigates into Shell submenu and updates history size', async () => {
    // Select [4] Shell, then [2] History Size, type 5000, then q, then q
    const rl = createMockRl(['4', '2', '5000', 'q', 'q'])
    const result = await executeSettings(rl, {})

    expect(vi.mocked(saveConfig)).toHaveBeenCalledWith(
      expect.objectContaining({ history_size: 5000 })
    )
    expect(result).toEqual({ historySize: 5000 })
  })

  it('rejects history size below 100', async () => {
    // Select [4] Shell, then [2] History Size, type 50, then q, then q
    const rl = createMockRl(['4', '2', '50', 'q', 'q'])
    const result = await executeSettings(rl, {})

    expect(vi.mocked(saveConfig)).not.toHaveBeenCalled()
    expect(result).toEqual({})
  })

  it('rejects non-numeric history size', async () => {
    // Select [4] Shell, then [2] History Size, type abc, then q, then q
    const rl = createMockRl(['4', '2', 'abc', 'q', 'q'])
    const result = await executeSettings(rl, {})

    expect(vi.mocked(saveConfig)).not.toHaveBeenCalled()
    expect(result).toEqual({})
  })

  it('navigates into AI submenu and sets permissions', async () => {
    // Select [2] AI, then [3] Permissions, select [1] auto, then q (exit AI), then q (exit main)
    const rl = createMockRl(['2', '3', '1', 'q', 'q'])
    const result = await executeSettings(rl, {})

    expect(vi.mocked(saveConfig)).toHaveBeenCalledWith(
      expect.objectContaining({ permissions: 'auto' })
    )
    expect(result).toEqual({ permissions: 'auto' })
  })
})
