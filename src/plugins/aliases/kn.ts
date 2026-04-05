import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "kn",
  version: '1.0.0',
  description: "Knative CLI aliases (ported from oh-my-zsh)",
  aliases: {
    "kns": "kn service",
    "knsl": "kn service list",
    "knsc": "kn service create",
    "knsd": "kn service delete",
    "knsu": "kn service update",
    "knr": "kn revision",
    "knrl": "kn revision list",
  },
}
