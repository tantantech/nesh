import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "fnm",
  version: '1.0.0',
  description: "Fast Node Manager aliases (ported from oh-my-zsh)",
  aliases: {
    "fnmi": "fnm install",
    "fnmu": "fnm use",
    "fnml": "fnm list",
    "fnmlr": "fnm list-remote",
    "fnmd": "fnm default",
    "fnmc": "fnm current",
  },
}
