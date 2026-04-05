import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "eza",
  version: '1.0.0',
  description: "eza (modern ls) aliases (ported from oh-my-zsh)",
  aliases: {
    "ls": "eza",
    "l": "eza -lah",
    "la": "eza -lah",
    "ll": "eza -lh",
    "lt": "eza --tree",
    "lt2": "eza --tree --level=2",
    "lt3": "eza --tree --level=3",
    "lg": "eza -lah --git",
  },
}
