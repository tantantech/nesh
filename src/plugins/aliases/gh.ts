import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "gh",
  version: '1.0.0',
  description: "GitHub CLI aliases (ported from oh-my-zsh)",
  aliases: {
    "ghpr": "gh pr",
    "ghprc": "gh pr create",
    "ghprl": "gh pr list",
    "ghprv": "gh pr view",
    "ghprco": "gh pr checkout",
    "ghi": "gh issue",
    "ghic": "gh issue create",
    "ghil": "gh issue list",
    "ghiv": "gh issue view",
    "ghr": "gh repo",
    "ghrc": "gh repo clone",
    "ghrv": "gh repo view",
  },
}
