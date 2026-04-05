import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "xcode",
  version: '1.0.0',
  description: "Xcode aliases (ported from oh-my-zsh)",
  aliases: {
    "xb": "xcodebuild",
    "xbc": "xcodebuild clean",
    "xbt": "xcodebuild test",
    "xcdd": "rm -rf ~/Library/Developer/Xcode/DerivedData",
  },
}
