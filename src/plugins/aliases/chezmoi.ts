import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "chezmoi",
  version: '1.0.0',
  description: "Chezmoi dotfile manager aliases (ported from oh-my-zsh)",
  aliases: {
    "cz": "chezmoi",
    "cza": "chezmoi add",
    "cze": "chezmoi edit",
    "czd": "chezmoi diff",
    "czu": "chezmoi update",
    "czap": "chezmoi apply",
    "czcd": "chezmoi cd",
  },
}
