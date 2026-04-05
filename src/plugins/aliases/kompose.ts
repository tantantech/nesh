import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "kompose",
  version: '1.0.0',
  description: "Kompose aliases (ported from oh-my-zsh)",
  aliases: {
    "kc": "kompose convert",
    "ku": "kompose up",
    "kd": "kompose down",
  },
}
