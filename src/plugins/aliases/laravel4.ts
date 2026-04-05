import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "laravel4",
  version: '1.0.0',
  description: "Laravel 4 aliases (ported from oh-my-zsh)",
  aliases: {
    "la4": "php artisan",
    "la4dump": "php artisan dump-autoload",
  },
}
