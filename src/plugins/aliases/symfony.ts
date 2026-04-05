import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "symfony",
  version: '1.0.0',
  description: "Symfony aliases (ported from oh-my-zsh)",
  aliases: {
    "sf": "symfony",
    "sfs": "symfony serve",
    "sfc": "symfony console",
  },
}
