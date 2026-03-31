#!/usr/bin/env node
import { createRequire } from 'node:module'
import { runShell } from './shell.js'

if (process.argv.includes('--version') || process.argv.includes('-v')) {
  const require = createRequire(import.meta.url)
  const pkg = require('../package.json') as { version: string }
  process.stdout.write(`claudeshell v${pkg.version}\n`)
  process.exit(0)
}

runShell().catch((err) => {
  process.stderr.write(`ClaudeShell fatal error: ${(err as Error).message}\n`)
  process.exit(1)
})
