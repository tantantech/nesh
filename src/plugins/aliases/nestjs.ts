import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "nestjs",
  version: '1.0.0',
  description: "NestJS CLI aliases (ported from oh-my-zsh)",
  aliases: {
    "nest": "nest",
    "nestn": "nest new",
    "nestg": "nest generate",
    "nests": "nest start",
    "nestsd": "nest start --debug",
    "nestb": "nest build",
  },
}
