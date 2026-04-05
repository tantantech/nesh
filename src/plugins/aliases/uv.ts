import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "uv",
  version: '1.0.0',
  description: "uv Python package manager aliases (ported from oh-my-zsh)",
  aliases: {
    "uvi": "uv pip install",
    "uvr": "uv run",
    "uvs": "uv sync",
    "uva": "uv add",
    "uvad": "uv add --dev",
    "uvl": "uv lock",
    "uvv": "uv venv",
  },
}
