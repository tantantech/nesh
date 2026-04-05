import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "redis-cli",
  version: '1.0.0',
  description: "Redis CLI aliases (ported from oh-my-zsh)",
  aliases: {
    "rdcli": "redis-cli",
    "rds": "redis-server",
  },
}
