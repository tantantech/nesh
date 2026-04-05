import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "oc",
  version: '1.0.0',
  description: "OpenShift CLI aliases (ported from oh-my-zsh)",
  aliases: {
    "ocp": "oc project",
    "ocl": "oc login",
    "ocg": "oc get",
    "ocd": "oc describe",
    "ocs": "oc status",
    "ocn": "oc new-project",
  },
}
