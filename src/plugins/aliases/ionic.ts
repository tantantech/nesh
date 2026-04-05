import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "ionic",
  version: '1.0.0',
  description: "Ionic CLI aliases (ported from oh-my-zsh)",
  aliases: {
    "ion": "ionic",
    "ions": "ionic serve",
    "ionb": "ionic build",
    "iong": "ionic generate",
  },
}
