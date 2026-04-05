import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "keychain",
  version: '1.0.0',
  description: "Keychain aliases (ported from oh-my-zsh)",
  aliases: {
    "kc": "keychain",
    "kcl": "keychain --list",
  },
}
