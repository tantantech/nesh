import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "nmap",
  version: '1.0.0',
  description: "Nmap aliases (ported from oh-my-zsh)",
  aliases: {
    "nms": "nmap -sS",
    "nma": "nmap -A",
    "nmf": "nmap -sV -sC",
    "nmp": "nmap -Pn",
  },
}
