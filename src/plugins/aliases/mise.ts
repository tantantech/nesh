import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "mise",
  version: '1.0.0',
  description: "mise aliases (ported from oh-my-zsh)",
  aliases: {
    "mi": "mise install",
    "mu": "mise use",
    "ml": "mise list",
    "mr": "mise run",
    "mls": "mise ls",
  },
}
