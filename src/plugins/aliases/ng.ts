import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "ng",
  version: '1.0.0',
  description: "Angular CLI aliases (ported from oh-my-zsh)",
  aliases: {
    "ngs": "ng serve",
    "ngb": "ng build",
    "ngt": "ng test",
    "ngg": "ng generate",
    "nge2e": "ng e2e",
    "ngn": "ng new",
    "ngl": "ng lint",
  },
}
