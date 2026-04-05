import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "react-native",
  version: '1.0.0',
  description: "React Native aliases (ported from oh-my-zsh)",
  aliases: {
    "rn": "npx react-native",
    "rns": "npx react-native start",
    "rnr": "npx react-native run-android",
    "rnri": "npx react-native run-ios",
    "rnl": "npx react-native log-android",
    "rnli": "npx react-native log-ios",
  },
}
