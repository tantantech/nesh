import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "scw",
  version: '1.0.0',
  description: "Scaleway CLI aliases (ported from oh-my-zsh)",
  aliases: {
    "scw": "scw",
    "scwi": "scw instance",
    "scwil": "scw instance server list",
    "scwk": "scw k8s",
    "scwkl": "scw k8s cluster list",
  },
}
