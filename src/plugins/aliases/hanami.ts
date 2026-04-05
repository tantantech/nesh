import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "hanami",
  version: '1.0.0',
  description: "Hanami aliases (ported from oh-my-zsh)",
  aliases: {
    "hn": "hanami",
    "hns": "hanami server",
    "hnc": "hanami console",
    "hng": "hanami generate",
    "hnr": "hanami routes",
  },
}
