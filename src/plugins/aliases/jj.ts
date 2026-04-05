import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "jj",
  version: '1.0.0',
  description: "Jujutsu VCS aliases (ported from oh-my-zsh)",
  aliases: {
    "jjd": "jj diff",
    "jjl": "jj log",
    "jjs": "jj status",
    "jjn": "jj new",
    "jje": "jj edit",
    "jjds": "jj describe",
    "jjgp": "jj git push",
    "jjgf": "jj git fetch",
  },
}
