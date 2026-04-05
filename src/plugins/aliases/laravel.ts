import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "laravel",
  version: '1.0.0',
  description: "Laravel aliases (ported from oh-my-zsh)",
  aliases: {
    "pa": "php artisan",
    "pas": "php artisan serve",
    "pam": "php artisan migrate",
    "pamf": "php artisan migrate --force",
    "pamr": "php artisan migrate:rollback",
    "pams": "php artisan migrate:status",
    "pat": "php artisan tinker",
    "pamk": "php artisan make",
  },
}
