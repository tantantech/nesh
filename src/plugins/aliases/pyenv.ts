import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "pyenv",
  version: '1.0.0',
  description: "pyenv aliases (ported from oh-my-zsh)",
  aliases: {
    "pyi": "pyenv install",
    "pyl": "pyenv local",
    "pyg": "pyenv global",
    "pyv": "pyenv versions",
    "pys": "pyenv shell",
  },
}
