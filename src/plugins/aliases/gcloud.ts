import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "gcloud",
  version: '1.0.0',
  description: "Google Cloud CLI aliases (ported from oh-my-zsh)",
  aliases: {
    "gcc": "gcloud config",
    "gccl": "gcloud config list",
    "gccs": "gcloud config set",
    "gcce": "gcloud compute",
    "gcci": "gcloud compute instances",
    "gccil": "gcloud compute instances list",
    "gcl": "gcloud container clusters list",
    "gcp": "gcloud projects list",
  },
}
