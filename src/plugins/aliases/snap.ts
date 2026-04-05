import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "snap",
  version: '1.0.0',
  description: "Snap aliases (ported from oh-my-zsh)",
  aliases: {
    "sni": "sudo snap install",
    "snr": "sudo snap remove",
    "snl": "snap list",
    "snf": "snap find",
    "snu": "sudo snap refresh",
  },
}
