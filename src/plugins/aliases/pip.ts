import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "pip",
  version: '1.0.0',
  description: "pip aliases (ported from oh-my-zsh)",
  aliases: {
    "pipi": "pip install",
    "pipig": "pip install --upgrade",
    "pipu": "pip uninstall",
    "pipf": "pip freeze",
    "pipl": "pip list",
    "pipo": "pip list --outdated",
    "pips": "pip show",
  },
}
