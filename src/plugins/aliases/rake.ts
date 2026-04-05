import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "rake",
  version: '1.0.0',
  description: "Rake aliases (ported from oh-my-zsh)",
  aliases: {
    "rk": "rake",
    "rkdb": "rake db:migrate",
    "rkdbs": "rake db:seed",
    "rkt": "rake test",
  },
}
