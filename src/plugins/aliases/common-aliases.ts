import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "common-aliases",
  version: '1.0.0',
  description: "Common shell aliases (portable subset)",
  aliases: {
    "l": "ls -lah",
    "la": "ls -lAh",
    "ll": "ls -lh",
    "lsa": "ls -lah",
    "md": "mkdir -p",
    "rd": "rmdir",
    "..": "cd ..",
    "...": "cd ../..",
    "....": "cd ../../..",
    ".....": "cd ../../../..",
    "H": "head",
    "T": "tail",
    "G": "grep",
  },
}
