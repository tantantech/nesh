import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "mosh",
  version: '1.0.0',
  description: "Mosh aliases (ported from oh-my-zsh)",
  aliases: {
    "msh": "mosh",
  },
}
