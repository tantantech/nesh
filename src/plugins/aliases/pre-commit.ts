import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "pre-commit",
  version: '1.0.0',
  description: "pre-commit aliases (ported from oh-my-zsh)",
  aliases: {
    "pci": "pre-commit install",
    "pcr": "pre-commit run",
    "pcra": "pre-commit run --all-files",
    "pcu": "pre-commit autoupdate",
  },
}
