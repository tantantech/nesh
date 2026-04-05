import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "composer",
  version: '1.0.0',
  description: "PHP Composer aliases (ported from oh-my-zsh)",
  aliases: {
    "c": "composer",
    "ci": "composer install",
    "cu": "composer update",
    "cr": "composer require",
    "crd": "composer require --dev",
    "ccp": "composer create-project",
    "cdu": "composer dump-autoload",
    "cg": "composer global",
    "cgi": "composer global install",
    "cgu": "composer global update",
  },
}
