import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "fabric",
  version: '1.0.0',
  description: "Fabric aliases (ported from oh-my-zsh)",
  aliases: {
    "fab": "fabric",
    "fabr": "fabric run",
    "fabp": "fabric put",
    "fabg": "fabric get",
  },
}
