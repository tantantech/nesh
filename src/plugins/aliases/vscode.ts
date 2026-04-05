import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "vscode",
  version: '1.0.0',
  description: "VS Code aliases (ported from oh-my-zsh)",
  aliases: {
    "vsc": "code",
    "vscd": "code --diff",
    "vscn": "code --new-window",
    "vscr": "code --reuse-window",
    "vsca": "code --add",
    "vsci": "code --install-extension",
    "vscu": "code --uninstall-extension",
  },
}
