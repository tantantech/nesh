import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "nats",
  version: '1.0.0',
  description: "NATS CLI aliases (ported from oh-my-zsh)",
  aliases: {
    "ntp": "nats pub",
    "nts": "nats sub",
    "ntr": "nats req",
    "ntstr": "nats stream",
    "ntcon": "nats consumer",
  },
}
