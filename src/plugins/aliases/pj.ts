import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "pj",
  version: '1.0.0',
  description: "Project jump aliases (ported from oh-my-zsh)",
  aliases: {
    "pjo": "pj open",
  },
}
