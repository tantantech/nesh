import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "opentofu",
  version: '1.0.0',
  description: "OpenTofu aliases (ported from oh-my-zsh)",
  aliases: {
    "ot": "tofu",
    "oti": "tofu init",
    "otp": "tofu plan",
    "ota": "tofu apply",
    "otaa": "tofu apply -auto-approve",
    "otd": "tofu destroy",
    "otf": "tofu fmt",
    "otv": "tofu validate",
    "ots": "tofu state",
    "otsl": "tofu state list",
  },
}
