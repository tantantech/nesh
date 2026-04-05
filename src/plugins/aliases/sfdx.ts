import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "sfdx",
  version: '1.0.0',
  description: "Salesforce DX aliases (ported from oh-my-zsh)",
  aliases: {
    "sfdx": "sfdx",
    "sfp": "sfdx force:source:push",
    "sfpl": "sfdx force:source:pull",
    "sfo": "sfdx force:org:open",
    "sfl": "sfdx force:org:list",
  },
}
