import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "capistrano",
  version: '1.0.0',
  description: "Capistrano aliases (ported from oh-my-zsh)",
  aliases: {
    "cap": "bundle exec cap",
    "capd": "bundle exec cap deploy",
  },
}
