import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "podman",
  version: '1.0.0',
  description: "Podman aliases (ported from oh-my-zsh)",
  aliases: {
    "pd": "podman",
    "pdr": "podman run",
    "pdps": "podman ps",
    "pdpa": "podman ps -a",
    "pdi": "podman images",
    "pdb": "podman build",
    "pdl": "podman logs",
    "pdlf": "podman logs -f",
    "pdst": "podman stop",
    "pdrm": "podman rm",
    "pdrmi": "podman rmi",
  },
}
