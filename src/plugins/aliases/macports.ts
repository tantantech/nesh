import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "macports",
  version: '1.0.0',
  description: "MacPorts aliases (ported from oh-my-zsh)",
  aliases: {
    "pi": "sudo port install",
    "pu": "sudo port uninstall",
    "ps": "port search",
    "psu": "sudo port selfupdate",
    "pup": "sudo port upgrade outdated",
  },
}
