import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "node",
  version: '1.0.0',
  description: "Node.js aliases (ported from oh-my-zsh)",
  aliases: {
    "nd": "node",
    "ndi": "node inspect",
  },
}
