import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "mongocli",
  version: '1.0.0',
  description: "MongoDB CLI aliases (ported from oh-my-zsh)",
  aliases: {
    "mg": "mongocli",
    "mga": "mongocli atlas",
    "mgac": "mongocli atlas clusters",
    "mgacl": "mongocli atlas clusters list",
  },
}
