import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "httpie",
  version: '1.0.0',
  description: "HTTPie aliases (ported from oh-my-zsh)",
  aliases: {
    "https": "http --default-scheme=https",
    "httpd": "http --download",
  },
}
