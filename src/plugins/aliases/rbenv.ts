import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "rbenv",
  version: '1.0.0',
  description: "rbenv aliases (ported from oh-my-zsh)",
  aliases: {
    "rbi": "rbenv install",
    "rbl": "rbenv local",
    "rbg": "rbenv global",
    "rbv": "rbenv versions",
    "rbs": "rbenv shell",
  },
}
