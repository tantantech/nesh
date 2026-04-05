import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "history",
  version: '1.0.0',
  description: "History aliases (ported from oh-my-zsh)",
  aliases: {
    "h": "history",
    "hs": "history | grep",
    "hsi": "history | grep -i",
  },
}
