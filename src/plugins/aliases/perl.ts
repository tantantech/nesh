import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "perl",
  version: '1.0.0',
  description: "Perl aliases (ported from oh-my-zsh)",
  aliases: {
    "pl": "perl",
    "pd": "perldoc",
  },
}
