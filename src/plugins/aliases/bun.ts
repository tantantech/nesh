import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "bun",
  version: '1.0.0',
  description: "Bun runtime aliases (ported from oh-my-zsh)",
  aliases: {
    "bi": "bun install",
    "ba": "bun add",
    "bad": "bun add -d",
    "brm": "bun remove",
    "br": "bun run",
    "brd": "bun run dev",
    "brb": "bun run build",
    "brt": "bun run test",
    "bx": "bunx",
  },
}
