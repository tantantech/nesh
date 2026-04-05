import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "heroku",
  version: '1.0.0',
  description: "Heroku aliases (ported from oh-my-zsh)",
  aliases: {
    "hk": "heroku",
    "hka": "heroku apps",
    "hkal": "heroku apps:list",
    "hkl": "heroku logs",
    "hklt": "heroku logs --tail",
    "hkr": "heroku run",
    "hkrc": "heroku run console",
    "hkp": "heroku ps",
    "hkc": "heroku config",
  },
}
