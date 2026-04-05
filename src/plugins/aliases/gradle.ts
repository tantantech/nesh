import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "gradle",
  version: '1.0.0',
  description: "Gradle aliases (ported from oh-my-zsh)",
  aliases: {
    "gw": "./gradlew",
    "gwb": "./gradlew build",
    "gwc": "./gradlew clean",
    "gwt": "./gradlew test",
    "gwr": "./gradlew run",
    "gwcb": "./gradlew clean build",
  },
}
