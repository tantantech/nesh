import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "golang",
  version: '1.0.0',
  description: "Go language aliases (ported from oh-my-zsh)",
  aliases: {
    "gob": "go build",
    "goc": "go clean",
    "god": "go doc",
    "gof": "go fmt",
    "gog": "go get",
    "goi": "go install",
    "gol": "go list",
    "gom": "go mod",
    "gomt": "go mod tidy",
    "gor": "go run",
    "got": "go test",
    "gov": "go vet",
  },
}
