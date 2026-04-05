import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "kate",
  version: '1.0.0',
  description: "Kate editor aliases (ported from oh-my-zsh)",
  aliases: {
    "kt": "kate",
    "ktn": "kate --new",
  },
}
