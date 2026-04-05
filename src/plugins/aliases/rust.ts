import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "rust",
  version: '1.0.0',
  description: "Rust/Cargo aliases (ported from oh-my-zsh)",
  aliases: {
    "cb": "cargo build",
    "cbr": "cargo build --release",
    "cr": "cargo run",
    "crr": "cargo run --release",
    "ct": "cargo test",
    "cc": "cargo check",
    "ccl": "cargo clippy",
    "cf": "cargo fmt",
    "cn": "cargo new",
    "ca": "cargo add",
    "cu": "cargo update",
    "cd": "cargo doc",
    "cdo": "cargo doc --open",
  },
}
