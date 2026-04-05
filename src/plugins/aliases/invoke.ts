import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "invoke",
  version: '1.0.0',
  description: "Invoke task runner aliases (ported from oh-my-zsh)",
  aliases: {
    "inv": "invoke",
    "invl": "invoke --list",
  },
}
