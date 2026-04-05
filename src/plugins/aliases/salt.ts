import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "salt",
  version: '1.0.0',
  description: "SaltStack aliases (ported from oh-my-zsh)",
  aliases: {
    "sa": "salt",
    "sak": "salt-key",
    "sac": "salt-call",
    "sar": "salt-run",
  },
}
