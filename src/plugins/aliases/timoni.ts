import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "timoni",
  version: '1.0.0',
  description: "Timoni aliases (ported from oh-my-zsh)",
  aliases: {
    "tma": "timoni apply",
    "tmb": "timoni build",
    "tml": "timoni list",
    "tmd": "timoni delete",
  },
}
