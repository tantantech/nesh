import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "hasura",
  version: '1.0.0',
  description: "Hasura CLI aliases (ported from oh-my-zsh)",
  aliases: {
    "hsc": "hasura console",
    "hsm": "hasura migrate",
    "hsms": "hasura migrate status",
    "hsma": "hasura migrate apply",
    "hss": "hasura seed",
    "hsmd": "hasura metadata",
    "hsmde": "hasura metadata export",
    "hsmda": "hasura metadata apply",
  },
}
