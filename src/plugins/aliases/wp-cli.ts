import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "wp-cli",
  version: '1.0.0',
  description: "WP-CLI aliases (ported from oh-my-zsh)",
  aliases: {
    "wpp": "wp plugin",
    "wppl": "wp plugin list",
    "wppi": "wp plugin install",
    "wppa": "wp plugin activate",
    "wpt": "wp theme",
    "wptl": "wp theme list",
  },
}
