import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "stripe",
  version: '1.0.0',
  description: "Stripe CLI aliases (ported from oh-my-zsh)",
  aliases: {
    "stl": "stripe listen",
    "stlf": "stripe listen --forward-to",
    "stlg": "stripe logs tail",
    "ste": "stripe events",
  },
}
