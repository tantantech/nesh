import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "kind",
  version: '1.0.0',
  description: "kind (Kubernetes in Docker) aliases (ported from oh-my-zsh)",
  aliases: {
    "kdc": "kind create cluster",
    "kdd": "kind delete cluster",
    "kdg": "kind get clusters",
    "kdl": "kind load docker-image",
  },
}
