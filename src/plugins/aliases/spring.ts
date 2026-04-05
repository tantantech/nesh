import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "spring",
  version: '1.0.0',
  description: "Spring Boot aliases (ported from oh-my-zsh)",
  aliases: {
    "spr": "spring run",
    "spi": "spring init",
  },
}
