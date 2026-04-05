import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "fluxcd",
  version: '1.0.0',
  description: "Flux CD aliases (ported from oh-my-zsh)",
  aliases: {
    "flx": "flux",
    "flxr": "flux reconcile",
    "flxg": "flux get",
    "flxga": "flux get all",
    "flxs": "flux suspend",
    "flxrs": "flux resume",
  },
}
