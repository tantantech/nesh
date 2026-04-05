import { describe, expect, it, vi } from 'vitest'
import { dispatchHook, buildHookBus } from '../../src/plugins/hooks.js'
import type { HookContext, PluginManifest } from '../../src/plugins/types.js'

const ctx: HookContext = { cwd: '/tmp' }

describe('dispatchHook', () => {
  it('calls all handlers and returns', async () => {
    const h1 = vi.fn()
    const h2 = vi.fn()

    await dispatchHook('preCommand', [h1, h2], ctx)

    expect(h1).toHaveBeenCalledWith(ctx)
    expect(h2).toHaveBeenCalledWith(ctx)
  })

  it('catches throwing handler, logs to stderr, and continues', async () => {
    const stderrSpy = vi.spyOn(process.stderr, 'write').mockReturnValue(true)
    const good = vi.fn()
    const bad = vi.fn().mockRejectedValue(new Error('boom'))

    await dispatchHook('postCommand', [bad, good], ctx)

    expect(good).toHaveBeenCalledWith(ctx)
    expect(stderrSpy).toHaveBeenCalledWith(
      expect.stringContaining('boom'),
    )

    stderrSpy.mockRestore()
  })

  it('resolves immediately with empty handlers array', async () => {
    await expect(dispatchHook('prePrompt', [], ctx)).resolves.toBeUndefined()
  })
})

describe('buildHookBus', () => {
  it('collects hooks from plugins grouped by HookName', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    const plugins: PluginManifest[] = [
      {
        name: 'p1',
        version: '1.0.0',
        description: 'test',
        hooks: { preCommand: handler1 },
      },
      {
        name: 'p2',
        version: '1.0.0',
        description: 'test',
        hooks: { preCommand: handler2, onCd: handler1 },
      },
    ]

    const bus = buildHookBus(plugins)

    expect(bus.preCommand).toEqual([handler1, handler2])
    expect(bus.onCd).toEqual([handler1])
    expect(bus.postCommand).toEqual([])
    expect(bus.prePrompt).toEqual([])
  })
})
