import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "tailscale",
  version: '1.0.0',
  description: "Tailscale aliases (ported from oh-my-zsh)",
  aliases: {
    "ts": "tailscale",
    "tss": "tailscale status",
    "tsu": "tailscale up",
    "tsd": "tailscale down",
    "tsip": "tailscale ip",
  },
}
