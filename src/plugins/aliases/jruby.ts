import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "jruby",
  version: '1.0.0',
  description: "JRuby aliases (ported from oh-my-zsh)",
  aliases: {
    "jr": "jruby",
    "jri": "jruby -S irb",
    "jrg": "jruby -S gem",
  },
}
