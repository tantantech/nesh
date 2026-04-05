import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "pm2",
  version: '1.0.0',
  description: "PM2 aliases (ported from oh-my-zsh)",
  aliases: {
    "pms": "pm2 start",
    "pmp": "pm2 stop",
    "pmr": "pm2 restart",
    "pml": "pm2 list",
    "pmlo": "pm2 logs",
    "pmm": "pm2 monit",
    "pmd": "pm2 delete",
  },
}
