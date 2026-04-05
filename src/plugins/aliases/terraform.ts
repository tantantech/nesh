import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "terraform",
  version: '1.0.0',
  description: "Terraform aliases (ported from oh-my-zsh)",
  aliases: {
    "tf": "terraform",
    "tfi": "terraform init",
    "tfp": "terraform plan",
    "tfa": "terraform apply",
    "tfaa": "terraform apply -auto-approve",
    "tfd": "terraform destroy",
    "tff": "terraform fmt",
    "tfv": "terraform validate",
    "tfs": "terraform state",
    "tfsl": "terraform state list",
    "tfo": "terraform output",
    "tfw": "terraform workspace",
    "tfwl": "terraform workspace list",
    "tfws": "terraform workspace select",
  },
}
