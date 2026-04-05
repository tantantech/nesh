import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "drush",
  version: '1.0.0',
  description: "Drush aliases (ported from oh-my-zsh)",
  aliases: {
    "dr": "drush",
    "drc": "drush cr",
    "drs": "drush status",
    "drul": "drush uli",
    "dren": "drush en",
    "drpm": "drush pml",
  },
}
