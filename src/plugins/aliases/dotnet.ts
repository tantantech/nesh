import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "dotnet",
  version: '1.0.0',
  description: ".NET CLI aliases (ported from oh-my-zsh)",
  aliases: {
    "dn": "dotnet",
    "dnr": "dotnet run",
    "dnb": "dotnet build",
    "dnt": "dotnet test",
    "dna": "dotnet add",
    "dnap": "dotnet add package",
    "dnnew": "dotnet new",
    "dnres": "dotnet restore",
    "dnp": "dotnet publish",
  },
}
