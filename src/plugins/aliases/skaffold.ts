import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "skaffold",
  version: '1.0.0',
  description: "Skaffold aliases (ported from oh-my-zsh)",
  aliases: {
    "skd": "skaffold dev",
    "skr": "skaffold run",
    "skb": "skaffold build",
    "skdel": "skaffold delete",
  },
}
