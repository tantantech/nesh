#!/usr/bin/env node
import { createRequire } from 'node:module'
import { runShell } from './shell.js'
import { runPipe } from './pipe.js'

if (process.argv.includes('--version') || process.argv.includes('-v')) {
  const require = createRequire(import.meta.url)
  const pkg = require('../package.json') as { version: string }
  process.stdout.write(`claudeshell v${pkg.version}\n`)
  process.exit(0)
}

if (!process.stdin.isTTY) {
  const prompt = process.argv.slice(2).join(' ')
  runPipe(prompt).catch((err) => {
    process.stderr.write(`ClaudeShell error: ${(err as Error).message}\n`)
    process.exit(1)
  })
} else {
  runShell().catch((err) => {
    process.stderr.write(`ClaudeShell fatal error: ${(err as Error).message}\n`)
    process.exit(1)
  })
}
