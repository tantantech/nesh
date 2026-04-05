import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "poetry",
  version: '1.0.0',
  description: "Poetry aliases (ported from oh-my-zsh)",
  aliases: {
    "poi": "poetry install",
    "poa": "poetry add",
    "poad": "poetry add --group dev",
    "porr": "poetry run",
    "pos": "poetry shell",
    "pob": "poetry build",
    "pop": "poetry publish",
    "pou": "poetry update",
    "pol": "poetry lock",
    "poex": "poetry export",
  },
}
