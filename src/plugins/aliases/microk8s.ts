import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "microk8s",
  version: '1.0.0',
  description: "MicroK8s aliases (ported from oh-my-zsh)",
  aliases: {
    "mk": "microk8s",
    "mkk": "microk8s kubectl",
    "mke": "microk8s enable",
    "mkd": "microk8s disable",
    "mks": "microk8s status",
  },
}
