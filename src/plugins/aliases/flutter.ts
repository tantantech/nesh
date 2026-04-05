import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "flutter",
  version: '1.0.0',
  description: "Flutter aliases (ported from oh-my-zsh)",
  aliases: {
    "fl": "flutter",
    "flr": "flutter run",
    "flb": "flutter build",
    "flt": "flutter test",
    "flc": "flutter clean",
    "flpg": "flutter pub get",
    "flpa": "flutter pub add",
    "fld": "flutter doctor",
    "flan": "flutter analyze",
  },
}
