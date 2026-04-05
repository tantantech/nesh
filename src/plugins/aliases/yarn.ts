import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "yarn",
  version: '1.0.0',
  description: "Yarn aliases (ported from oh-my-zsh)",
  aliases: {
    "y": "yarn",
    "ya": "yarn add",
    "yad": "yarn add --dev",
    "yrm": "yarn remove",
    "yr": "yarn run",
    "yrd": "yarn run dev",
    "yrb": "yarn run build",
    "yrt": "yarn run test",
    "ys": "yarn start",
    "yu": "yarn upgrade",
    "yui": "yarn upgrade-interactive",
    "yga": "yarn global add",
    "ygr": "yarn global remove",
  },
}
