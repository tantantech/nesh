import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "helm",
  version: '1.0.0',
  description: "Helm aliases (ported from oh-my-zsh)",
  aliases: {
    "h": "helm",
    "hi": "helm install",
    "hu": "helm upgrade",
    "hun": "helm uninstall",
    "hl": "helm list",
    "hs": "helm search",
    "hsr": "helm search repo",
    "hsh": "helm search hub",
    "hrr": "helm repo remove",
    "hra": "helm repo add",
    "hru": "helm repo update",
    "hrl": "helm repo list",
    "ht": "helm template",
    "hv": "helm version",
  },
}
