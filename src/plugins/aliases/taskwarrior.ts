import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "taskwarrior",
  version: '1.0.0',
  description: "Taskwarrior aliases (ported from oh-my-zsh)",
  aliases: {
    "tw": "task",
    "twa": "task add",
    "twl": "task list",
    "twd": "task done",
    "twm": "task modify",
  },
}
