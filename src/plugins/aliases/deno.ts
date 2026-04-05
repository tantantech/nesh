import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "deno",
  version: '1.0.0',
  description: "Deno aliases (ported from oh-my-zsh)",
  aliases: {
    "de": "deno",
    "der": "deno run",
    "det": "deno test",
    "deb": "deno bench",
    "def": "deno fmt",
    "del": "deno lint",
    "dec": "deno compile",
    "dei": "deno install",
  },
}
