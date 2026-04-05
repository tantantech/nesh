import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "git-lfs",
  version: '1.0.0',
  description: "Git LFS aliases (ported from oh-my-zsh)",
  aliases: {
    "glfsi": "git lfs install",
    "glfst": "git lfs track",
    "glfsls": "git lfs ls-files",
    "glfsp": "git lfs push",
    "glfspl": "git lfs pull",
  },
}
