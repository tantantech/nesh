import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "tldr",
  version: '1.0.0',
  description: "tldr aliases (ported from oh-my-zsh)",
  aliases: {
    "tldr": "tldr",
  },
}
