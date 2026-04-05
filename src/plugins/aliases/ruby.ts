import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "ruby",
  version: '1.0.0',
  description: "Ruby aliases (ported from oh-my-zsh)",
  aliases: {
    "rb": "ruby",
    "rbi": "ruby -e \"require 'irb'; IRB.start\"",
  },
}
