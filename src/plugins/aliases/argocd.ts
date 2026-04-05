import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "argocd",
  version: '1.0.0',
  description: "Argo CD aliases (ported from oh-my-zsh)",
  aliases: {
    "argocd": "argocd",
    "argc": "argocd cluster",
    "argcl": "argocd cluster list",
    "arga": "argocd app",
    "argal": "argocd app list",
    "argas": "argocd app sync",
    "argag": "argocd app get",
    "argad": "argocd app delete",
    "argp": "argocd proj",
    "argpl": "argocd proj list",
  },
}
