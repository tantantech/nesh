import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "grails",
  version: '1.0.0',
  description: "Grails aliases (ported from oh-my-zsh)",
  aliases: {
    "gra": "grails",
    "grra": "grails run-app",
    "grta": "grails test-app",
  },
}
