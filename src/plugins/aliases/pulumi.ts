import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "pulumi",
  version: '1.0.0',
  description: "Pulumi aliases (ported from oh-my-zsh)",
  aliases: {
    "pu": "pulumi",
    "puu": "pulumi up",
    "pup": "pulumi preview",
    "pud": "pulumi destroy",
    "pus": "pulumi stack",
    "pusl": "pulumi stack ls",
    "puc": "pulumi config",
  },
}
