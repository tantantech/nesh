import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "arcanist",
  version: '1.0.0',
  description: "Arcanist aliases (ported from oh-my-zsh)",
  aliases: {
    "ad": "arc diff",
    "adp": "arc diff --preview",
    "al": "arc land",
    "ab": "arc branch",
  },
}
