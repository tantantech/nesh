import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "volta",
  version: '1.0.0',
  description: "Volta aliases (ported from oh-my-zsh)",
  aliases: {
    "vli": "volta install",
    "vlp": "volta pin",
    "vll": "volta list",
    "vlr": "volta run",
  },
}
