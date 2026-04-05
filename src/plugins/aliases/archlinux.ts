import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "archlinux",
  version: '1.0.0',
  description: "Arch Linux aliases (partial)",
  aliases: {
    "paci": "sudo pacman -S",
    "pacr": "sudo pacman -Rns",
    "pacs": "pacman -Ss",
    "pacu": "sudo pacman -Syu",
    "pacq": "pacman -Qi",
    "pacl": "pacman -Ql",
  },
}
