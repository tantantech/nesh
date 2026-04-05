import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "rvm",
  version: '1.0.0',
  description: "RVM aliases (ported from oh-my-zsh)",
  aliases: {
    "rvmu": "rvm use",
    "rvmi": "rvm install",
    "rvml": "rvm list",
    "rvmg": "rvm gemset",
  },
}
