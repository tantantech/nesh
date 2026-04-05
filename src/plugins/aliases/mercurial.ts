import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "mercurial",
  version: '1.0.0',
  description: "Mercurial aliases (ported from oh-my-zsh)",
  aliases: {
    "hgs": "hg status",
    "hgd": "hg diff",
    "hgc": "hg commit",
    "hgp": "hg push",
    "hgu": "hg pull --update",
    "hgl": "hg log",
    "hgb": "hg branch",
  },
}
