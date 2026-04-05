import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "symfony2",
  version: '1.0.0',
  description: "Symfony 2 aliases (ported from oh-my-zsh)",
  aliases: {
    "sf2": "php app/console",
    "sf2cc": "php app/console cache:clear",
  },
}
