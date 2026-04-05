import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "pipenv",
  version: '1.0.0',
  description: "Pipenv aliases (ported from oh-my-zsh)",
  aliases: {
    "pei": "pipenv install",
    "peid": "pipenv install --dev",
    "peru": "pipenv run",
    "pesh": "pipenv shell",
    "peun": "pipenv uninstall",
    "peup": "pipenv update",
    "peg": "pipenv graph",
  },
}
