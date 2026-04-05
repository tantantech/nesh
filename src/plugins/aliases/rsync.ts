import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "rsync",
  version: '1.0.0',
  description: "rsync aliases (ported from oh-my-zsh)",
  aliases: {
    "rscp": "rsync -avz --progress",
    "rsmv": "rsync -avz --progress --remove-source-files",
  },
}
