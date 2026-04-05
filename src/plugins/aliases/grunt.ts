import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "grunt",
  version: '1.0.0',
  description: "Grunt aliases (ported from oh-my-zsh)",
  aliases: {
    "gr": "grunt",
    "grd": "grunt --debug",
  },
}
