import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "sdk",
  version: '1.0.0',
  description: "SDKMAN aliases (ported from oh-my-zsh)",
  aliases: {
    "sdki": "sdk install",
    "sdku": "sdk use",
    "sdkl": "sdk list",
    "sdkc": "sdk current",
    "sdkd": "sdk default",
  },
}
