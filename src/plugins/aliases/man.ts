import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "man",
  version: '1.0.0',
  description: "Man page aliases (ported from oh-my-zsh)",
  aliases: {
    "manp": "man -P cat",
  },
}
