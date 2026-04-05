import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "lol",
  version: '1.0.0',
  description: "Fun command aliases (ported from oh-my-zsh)",
  aliases: {
    "plz": "sudo",
    "icanhas": "mkdir",
    "gimmeh": "touch",
    "dowant": "cp",
    "nowai": "rm",
    "gtfo": "mv",
    "hai": "cd",
    "kthxbai": "exit",
  },
}
