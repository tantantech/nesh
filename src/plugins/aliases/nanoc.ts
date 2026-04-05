import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "nanoc",
  version: '1.0.0',
  description: "Nanoc aliases (ported from oh-my-zsh)",
  aliases: {
    "nc": "nanoc",
    "ncc": "nanoc compile",
    "ncv": "nanoc view",
  },
}
