import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "ansible",
  version: '1.0.0',
  description: "Ansible aliases (ported from oh-my-zsh)",
  aliases: {
    "a": "ansible",
    "ap": "ansible-playbook",
    "avc": "ansible-vault create",
    "ave": "ansible-vault edit",
    "avr": "ansible-vault rekey",
    "avd": "ansible-vault decrypt",
    "avv": "ansible-vault view",
    "aga": "ansible-galaxy",
    "agad": "ansible-galaxy delete",
    "agai": "ansible-galaxy install",
    "agal": "ansible-galaxy list",
    "agas": "ansible-galaxy search",
  },
}
