import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "brew",
  version: '1.0.0',
  description: "Homebrew aliases (macOS only, partial)",
  aliases: {
    "bri": "brew install",
    "bris": "brew install --cask",
    "bru": "brew uninstall",
    "brup": "brew update",
    "brug": "brew upgrade",
    "brs": "brew search",
    "brl": "brew list",
    "brd": "brew doctor",
    "bro": "brew outdated",
    "brci": "brew info",
  },
}
