import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "gitignore",
  version: '1.0.0',
  description: "gitignore.io aliases (ported from oh-my-zsh)",
  aliases: {
    "gi": "curl -sL https://www.toptal.com/developers/gitignore/api/",
  },
}
