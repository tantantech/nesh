import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "zoxide",
  version: '1.0.0',
  description: "Zoxide aliases (ported from oh-my-zsh)",
  aliases: {
    "z": "zoxide query",
    "zi": "zoxide query -i",
    "za": "zoxide add",
    "zr": "zoxide remove",
  },
}
