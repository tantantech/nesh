import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "gem",
  version: '1.0.0',
  description: "RubyGems aliases (ported from oh-my-zsh)",
  aliases: {
    "gei": "gem install",
    "geu": "gem update",
    "gel": "gem list",
    "ges": "gem search",
    "geui": "gem uninstall",
  },
}
