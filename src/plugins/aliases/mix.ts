import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "mix",
  version: '1.0.0',
  description: "Elixir Mix aliases (ported from oh-my-zsh)",
  aliases: {
    "mx": "mix",
    "mxc": "mix compile",
    "mxt": "mix test",
    "mxd": "mix deps.get",
    "mxs": "mix phx.server",
    "mxn": "mix new",
  },
}
