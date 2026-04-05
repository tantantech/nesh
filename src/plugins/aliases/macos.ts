import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "macos",
  version: '1.0.0',
  description: "macOS utility aliases (partial)",
  aliases: {
    "showfiles": "defaults write com.apple.finder AppleShowAllFiles -bool true && killall Finder",
    "hidefiles": "defaults write com.apple.finder AppleShowAllFiles -bool false && killall Finder",
    "flushdns": "sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder",
    "cleanup": "find . -type f -name \"*.DS_Store\" -ls -delete",
    "emptytrash": "sudo rm -rfv /Volumes/*/.Trashes; sudo rm -rfv ~/.Trash",
  },
}
