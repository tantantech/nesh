import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "nodenv",
  version: '1.0.0',
  description: "nodenv aliases (ported from oh-my-zsh)",
  aliases: {
    "nei": "nodenv install",
    "nel": "nodenv local",
    "neg": "nodenv global",
    "nes": "nodenv shell",
    "nev": "nodenv versions",
  },
}
