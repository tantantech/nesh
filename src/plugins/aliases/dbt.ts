import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "dbt",
  version: '1.0.0',
  description: "dbt aliases (ported from oh-my-zsh)",
  aliases: {
    "dbtr": "dbt run",
    "dbtt": "dbt test",
    "dbtb": "dbt build",
    "dbtd": "dbt docs",
    "dbtdg": "dbt docs generate",
    "dbtds": "dbt docs serve",
    "dbts": "dbt seed",
  },
}
