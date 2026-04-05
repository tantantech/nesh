import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "sublime",
  version: '1.0.0',
  description: "Sublime Text aliases (ported from oh-my-zsh)",
  aliases: {
    "st": "subl",
    "stt": "subl .",
    "stn": "subl --new-window",
  },
}
