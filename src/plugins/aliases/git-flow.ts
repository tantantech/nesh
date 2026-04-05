import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "git-flow",
  version: '1.0.0',
  description: "Git Flow aliases (ported from oh-my-zsh)",
  aliases: {
    "gfi": "git flow init",
    "gff": "git flow feature",
    "gffs": "git flow feature start",
    "gfff": "git flow feature finish",
    "gfr": "git flow release",
    "gfrs": "git flow release start",
    "gfrf": "git flow release finish",
    "gfh": "git flow hotfix",
    "gfhs": "git flow hotfix start",
    "gfhf": "git flow hotfix finish",
  },
}
