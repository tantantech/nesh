import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "gulp",
  version: '1.0.0',
  description: "Gulp aliases (ported from oh-my-zsh)",
  aliases: {
    "gu": "gulp",
    "gub": "gulp build",
    "gut": "gulp test",
    "guc": "gulp clean",
  },
}
