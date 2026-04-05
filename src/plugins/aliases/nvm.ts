import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "nvm",
  version: '1.0.0',
  description: "nvm aliases (ported from oh-my-zsh)",
  aliases: {
    "nvmi": "nvm install",
    "nvmu": "nvm use",
    "nvml": "nvm list",
    "nvmlr": "nvm ls-remote",
    "nvmd": "nvm alias default",
    "nvmc": "nvm current",
  },
}
