import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "tig",
  version: '1.0.0',
  description: "Tig aliases (ported from oh-my-zsh)",
  aliases: {
    "tg": "tig",
    "tgs": "tig status",
    "tgb": "tig blame",
  },
}
