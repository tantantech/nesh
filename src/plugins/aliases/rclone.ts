import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "rclone",
  version: '1.0.0',
  description: "rclone aliases (ported from oh-my-zsh)",
  aliases: {
    "rcl": "rclone",
    "rcls": "rclone sync",
    "rclc": "rclone copy",
    "rclls": "rclone ls",
  },
}
