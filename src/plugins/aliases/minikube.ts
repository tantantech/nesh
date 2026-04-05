import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "minikube",
  version: '1.0.0',
  description: "Minikube aliases (ported from oh-my-zsh)",
  aliases: {
    "mkb": "minikube",
    "mkbs": "minikube start",
    "mkbp": "minikube stop",
    "mkbd": "minikube delete",
    "mkbst": "minikube status",
    "mkbssh": "minikube ssh",
    "mkbip": "minikube ip",
  },
}
