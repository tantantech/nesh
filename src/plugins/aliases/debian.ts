import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "debian",
  version: '1.0.0',
  description: "Debian/apt aliases (ported from oh-my-zsh)",
  aliases: {
    "agi": "sudo apt-get install",
    "agr": "sudo apt-get remove",
    "agu": "sudo apt-get update",
    "agug": "sudo apt-get upgrade",
    "acs": "apt-cache search",
    "agud": "sudo apt-get dist-upgrade",
    "agp": "sudo apt-get purge",
    "agar": "sudo apt-get autoremove",
  },
}
