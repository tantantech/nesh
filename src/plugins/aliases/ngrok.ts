import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "ngrok",
  version: '1.0.0',
  description: "ngrok aliases (ported from oh-my-zsh)",
  aliases: {
    "ngr": "ngrok",
    "ngrh": "ngrok http",
    "ngrt": "ngrok tcp",
  },
}
