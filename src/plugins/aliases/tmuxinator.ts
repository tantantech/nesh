import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "tmuxinator",
  version: '1.0.0',
  description: "Tmuxinator aliases (ported from oh-my-zsh)",
  aliases: {
    "mux": "tmuxinator",
    "muxs": "tmuxinator start",
    "muxo": "tmuxinator open",
    "muxn": "tmuxinator new",
    "muxl": "tmuxinator list",
    "muxe": "tmuxinator edit",
    "muxd": "tmuxinator delete",
  },
}
