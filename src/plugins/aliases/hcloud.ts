import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "hcloud",
  version: '1.0.0',
  description: "Hetzner Cloud CLI aliases (ported from oh-my-zsh)",
  aliases: {
    "hc": "hcloud",
    "hcs": "hcloud server",
    "hcsl": "hcloud server list",
    "hcsc": "hcloud server create",
    "hcsd": "hcloud server delete",
    "hcn": "hcloud network",
    "hcnl": "hcloud network list",
  },
}
