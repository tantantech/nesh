import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "scala",
  version: '1.0.0',
  description: "Scala aliases (ported from oh-my-zsh)",
  aliases: {
    "sc": "scala",
    "scc": "scalac",
    "sbt": "sbt",
    "sbtt": "sbt test",
    "sbtc": "sbt compile",
    "sbtr": "sbt run",
  },
}
