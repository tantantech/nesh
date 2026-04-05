import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "lein",
  version: '1.0.0',
  description: "Leiningen aliases (ported from oh-my-zsh)",
  aliases: {
    "le": "lein",
    "ler": "lein repl",
    "let": "lein test",
    "lec": "lein clean",
    "led": "lein deps",
  },
}
