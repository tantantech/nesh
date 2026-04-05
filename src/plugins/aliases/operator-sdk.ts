import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "operator-sdk",
  version: '1.0.0',
  description: "Operator SDK aliases (ported from oh-my-zsh)",
  aliases: {
    "osdk": "operator-sdk",
    "osdki": "operator-sdk init",
    "osdkca": "operator-sdk create api",
    "osdkb": "operator-sdk build",
  },
}
