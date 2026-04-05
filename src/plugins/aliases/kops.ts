import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "kops",
  version: '1.0.0',
  description: "Kops aliases (ported from oh-my-zsh)",
  aliases: {
    "kpsc": "kops create cluster",
    "kpsd": "kops delete cluster",
    "kpsu": "kops update cluster",
    "kpsv": "kops validate cluster",
    "kpsg": "kops get",
    "kpse": "kops edit",
  },
}
