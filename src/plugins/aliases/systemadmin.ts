import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "systemadmin",
  version: '1.0.0',
  description: "System admin aliases (ported from oh-my-zsh)",
  aliases: {
    "psg": "ps aux | grep",
    "dud": "du -d 1 -h",
    "duf": "du -sh",
    "fdr": "find . -type d -name",
    "ffr": "find . -type f -name",
  },
}
