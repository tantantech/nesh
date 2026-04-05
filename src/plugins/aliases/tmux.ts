import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "tmux",
  version: '1.0.0',
  description: "tmux aliases (ported from oh-my-zsh)",
  aliases: {
    "ta": "tmux attach -t",
    "tad": "tmux attach -d -t",
    "tks": "tmux kill-session -t",
    "tkss": "tmux kill-server",
    "tl": "tmux list-sessions",
    "tn": "tmux new-session -s",
    "ts": "tmux new-session -s",
  },
}
