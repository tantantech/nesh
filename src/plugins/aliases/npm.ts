import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "npm",
  version: '1.0.0',
  description: "npm aliases (ported from oh-my-zsh)",
  aliases: {
    "ni": "npm install",
    "nig": "npm install -g",
    "nis": "npm install --save",
    "nisd": "npm install --save-dev",
    "nr": "npm run",
    "nrd": "npm run dev",
    "nrb": "npm run build",
    "nrt": "npm run test",
    "nrs": "npm start",
    "nrp": "npm publish",
    "nau": "npm audit",
    "nauf": "npm audit fix",
    "nu": "npm update",
    "nls": "npm list",
    "nout": "npm outdated",
  },
}
