import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "azure",
  version: '1.0.0',
  description: "Azure CLI aliases (ported from oh-my-zsh)",
  aliases: {
    "az": "az",
    "azl": "az login",
    "azacc": "az account",
    "azaccl": "az account list",
    "azaccs": "az account set",
    "azvm": "az vm",
    "azvml": "az vm list",
    "azaks": "az aks",
    "azaksl": "az aks list",
    "azg": "az group",
    "azgl": "az group list",
  },
}
