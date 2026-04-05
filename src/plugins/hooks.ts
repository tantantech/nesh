import type { HookName, HookHandler, HookContext, PluginManifest } from './types.js'

export type HookBus = Readonly<Record<HookName, readonly HookHandler[]>>

const HOOK_NAMES: readonly HookName[] = ['preCommand', 'postCommand', 'prePrompt', 'onCd']

export async function dispatchHook(
  hookName: string,
  handlers: readonly HookHandler[],
  context: Readonly<HookContext>,
): Promise<void> {
  if (handlers.length === 0) return

  const results = await Promise.allSettled(
    handlers.map((h) => Promise.resolve(h(context))),
  )

  for (const result of results) {
    if (result.status === 'rejected') {
      const reason = result.reason instanceof Error ? result.reason : new Error(String(result.reason))
      process.stderr.write(
        `[nesh] hook "${hookName}" handler failed: ${reason.message}\n`,
      )
    }
  }
}

export function buildHookBus(plugins: readonly PluginManifest[]): HookBus {
  const bus: Record<HookName, HookHandler[]> = {
    preCommand: [],
    postCommand: [],
    prePrompt: [],
    onCd: [],
  }

  for (const plugin of plugins) {
    if (!plugin.hooks) continue
    for (const hookName of HOOK_NAMES) {
      const handler = plugin.hooks[hookName]
      if (handler !== undefined) {
        bus[hookName] = [...bus[hookName], handler]
      }
    }
  }

  return Object.freeze(bus)
}
