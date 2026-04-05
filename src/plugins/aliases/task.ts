import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "task",
  version: '1.0.0',
  description: "Taskfile aliases (ported from oh-my-zsh)",
  aliases: {
    "tk": "task",
    "tkl": "task --list",
  },
}
