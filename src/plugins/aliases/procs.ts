import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "procs",
  version: '1.0.0',
  description: "procs aliases (ported from oh-my-zsh)",
  aliases: {
    "pp": "procs",
    "ppw": "procs --watch",
    "ppt": "procs --tree",
  },
}
