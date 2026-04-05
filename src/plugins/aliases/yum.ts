import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "yum",
  version: '1.0.0',
  description: "Yum aliases (ported from oh-my-zsh)",
  aliases: {
    "yi": "sudo yum install",
    "yr": "sudo yum remove",
    "yu": "sudo yum update",
    "ys": "yum search",
    "yl": "yum list installed",
  },
}
