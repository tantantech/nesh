import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "ubuntu",
  version: '1.0.0',
  description: "Ubuntu aliases (partial)",
  aliases: {
    "agi": "sudo apt install",
    "agr": "sudo apt remove",
    "agu": "sudo apt update",
    "agug": "sudo apt upgrade",
    "agdu": "sudo apt dist-upgrade",
    "acs": "apt search",
  },
}
