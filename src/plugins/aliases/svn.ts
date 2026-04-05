import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "svn",
  version: '1.0.0',
  description: "Subversion aliases (ported from oh-my-zsh)",
  aliases: {
    "svns": "svn status",
    "svnc": "svn commit",
    "svnu": "svn update",
    "svna": "svn add",
    "svnd": "svn diff",
    "svnl": "svn log",
  },
}
