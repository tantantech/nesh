import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "bundler",
  version: '1.0.0',
  description: "Ruby Bundler aliases (ported from oh-my-zsh)",
  aliases: {
    "be": "bundle exec",
    "bl": "bundle list",
    "bi": "bundle install",
    "bu": "bundle update",
    "bo": "bundle open",
    "bp": "bundle pack",
    "bout": "bundle outdated",
  },
}
