import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "laravel5",
  version: '1.0.0',
  description: "Laravel 5 aliases (ported from oh-my-zsh)",
  aliases: {
    "la5": "php artisan",
    "la5routes": "php artisan route:list",
    "la5cache": "php artisan cache:clear",
  },
}
