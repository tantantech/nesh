import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "git-extras",
  version: '1.0.0',
  description: "Git extras aliases (ported from oh-my-zsh)",
  aliases: {
    "gcount": "git shortlog --summary --numbered",
    "ginfo": "git summary",
    "gauthors": "git authors",
    "gef": "git effort",
    "gign": "git ignore",
  },
}
