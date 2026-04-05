import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "vagrant",
  version: '1.0.0',
  description: "Vagrant aliases (ported from oh-my-zsh)",
  aliases: {
    "vg": "vagrant",
    "vgu": "vagrant up",
    "vgd": "vagrant destroy",
    "vgs": "vagrant ssh",
    "vgst": "vagrant status",
    "vgh": "vagrant halt",
    "vgp": "vagrant provision",
    "vgr": "vagrant reload",
    "vggs": "vagrant global-status",
  },
}
