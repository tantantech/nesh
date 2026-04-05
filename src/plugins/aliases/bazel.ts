import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "bazel",
  version: '1.0.0',
  description: "Bazel aliases (ported from oh-my-zsh)",
  aliases: {
    "bzb": "bazel build",
    "bzt": "bazel test",
    "bzr": "bazel run",
    "bzq": "bazel query",
    "bzc": "bazel clean",
    "bzf": "bazel fetch",
  },
}
