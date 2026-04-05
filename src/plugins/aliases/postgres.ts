import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "postgres",
  version: '1.0.0',
  description: "PostgreSQL aliases (ported from oh-my-zsh)",
  aliases: {
    "pgs": "pg_isready",
    "pgcli": "pgcli",
    "psql": "psql",
  },
}
