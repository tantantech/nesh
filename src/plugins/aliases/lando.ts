import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "lando",
  version: '1.0.0',
  description: "Lando aliases (ported from oh-my-zsh)",
  aliases: {
    "la": "lando",
    "las": "lando start",
    "lap": "lando stop",
    "lar": "lando rebuild",
    "lai": "lando info",
    "lal": "lando logs",
  },
}
