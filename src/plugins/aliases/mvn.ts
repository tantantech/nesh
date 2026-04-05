import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "mvn",
  version: '1.0.0',
  description: "Maven aliases (ported from oh-my-zsh)",
  aliases: {
    "mvnci": "mvn clean install",
    "mvnc": "mvn clean",
    "mvnt": "mvn test",
    "mvnp": "mvn package",
    "mvnd": "mvn deploy",
    "mvnag": "mvn archetype:generate",
    "mvndt": "mvn dependency:tree",
  },
}
