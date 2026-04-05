import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "symfony6",
  version: '1.0.0',
  description: "Symfony 6 aliases (ported from oh-my-zsh)",
  aliases: {
    "sf6": "php bin/console",
    "sf6cc": "php bin/console cache:clear",
    "sf6mm": "php bin/console make:migration",
    "sf6dm": "php bin/console doctrine:migrations:migrate",
  },
}
