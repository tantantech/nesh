import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "vault",
  version: '1.0.0',
  description: "HashiCorp Vault aliases (ported from oh-my-zsh)",
  aliases: {
    "vl": "vault login",
    "vr": "vault read",
    "vw": "vault write",
    "vd": "vault delete",
    "vls": "vault list",
    "vs": "vault server",
    "vsd": "vault server -dev",
    "vst": "vault status",
  },
}
