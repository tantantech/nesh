import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "molecule",
  version: '1.0.0',
  description: "Ansible Molecule aliases (ported from oh-my-zsh)",
  aliases: {
    "mol": "molecule",
    "molt": "molecule test",
    "molc": "molecule converge",
    "mold": "molecule destroy",
    "moll": "molecule lint",
    "molv": "molecule verify",
  },
}
