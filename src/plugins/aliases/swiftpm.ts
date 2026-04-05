import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "swiftpm",
  version: '1.0.0',
  description: "Swift Package Manager aliases (ported from oh-my-zsh)",
  aliases: {
    "spb": "swift build",
    "spt": "swift test",
    "spr": "swift run",
    "spp": "swift package",
    "sppi": "swift package init",
    "sppu": "swift package update",
  },
}
