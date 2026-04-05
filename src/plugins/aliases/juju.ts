import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "juju",
  version: '1.0.0',
  description: "Juju aliases (ported from oh-my-zsh)",
  aliases: {
    "jd": "juju deploy",
    "js": "juju status",
    "jss": "juju switch",
    "jm": "juju models",
  },
}
