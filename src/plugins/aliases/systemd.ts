import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "systemd",
  version: '1.0.0',
  description: "Systemd aliases (ported from oh-my-zsh)",
  aliases: {
    "sc": "systemctl",
    "scs": "systemctl status",
    "scr": "sudo systemctl restart",
    "sce": "sudo systemctl enable",
    "scd": "sudo systemctl disable",
    "scst": "sudo systemctl start",
    "scsp": "sudo systemctl stop",
    "scrl": "sudo systemctl reload",
    "jc": "journalctl",
    "jcf": "journalctl -f",
  },
}
