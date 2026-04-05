import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "rails",
  version: '1.0.0',
  description: "Ruby on Rails aliases (ported from oh-my-zsh)",
  aliases: {
    "rc": "rails console",
    "rdb": "rails dbconsole",
    "rg": "rails generate",
    "rgm": "rails generate migration",
    "rs": "rails server",
    "rsd": "rails server --debugger",
    "rr": "rails routes",
    "rdm": "rails db:migrate",
    "rds": "rails db:seed",
    "rdr": "rails db:rollback",
  },
}
