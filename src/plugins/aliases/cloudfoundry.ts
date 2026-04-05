import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "cloudfoundry",
  version: '1.0.0',
  description: "Cloud Foundry aliases (ported from oh-my-zsh)",
  aliases: {
    "cf": "cf",
    "cfa": "cf apps",
    "cfs": "cf services",
    "cfp": "cf push",
    "cfl": "cf logs",
    "cfd": "cf delete",
    "cfr": "cf restage",
    "cfsc": "cf scale",
  },
}
