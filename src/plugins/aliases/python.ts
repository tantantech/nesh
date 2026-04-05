import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "python",
  version: '1.0.0',
  description: "Python aliases (ported from oh-my-zsh)",
  aliases: {
    "py": "python3",
    "py2": "python2",
    "pym": "python3 -m",
    "pyhttp": "python3 -m http.server",
    "pyjson": "python3 -m json.tool",
    "pyvenv": "python3 -m venv",
    "pypip": "python3 -m pip",
  },
}
