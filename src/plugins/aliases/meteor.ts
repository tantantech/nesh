import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "meteor",
  version: '1.0.0',
  description: "Meteor aliases (ported from oh-my-zsh)",
  aliases: {
    "mr": "meteor run",
    "ma": "meteor add",
    "mrm": "meteor remove",
    "mu": "meteor update",
    "mt": "meteor test",
  },
}
