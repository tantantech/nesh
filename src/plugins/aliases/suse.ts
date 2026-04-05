import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "suse",
  version: '1.0.0',
  description: "openSUSE aliases (partial)",
  aliases: {
    "zi": "sudo zypper install",
    "zr": "sudo zypper remove",
    "zu": "sudo zypper update",
    "zs": "zypper search",
    "zdup": "sudo zypper dup",
  },
}
