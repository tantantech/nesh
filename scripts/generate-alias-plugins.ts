#!/usr/bin/env npx tsx
/**
 * Batch generator for alias plugin files from the plugin catalog.
 * Reads ALIAS_PLUGIN_DATA and writes one TypeScript file per entry
 * into src/plugins/aliases/.
 *
 * Usage: npx tsx scripts/generate-alias-plugins.ts
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ALIAS_PLUGIN_DATA } from '../src/plugins/catalog.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')
const aliasesDir = join(rootDir, 'src', 'plugins', 'aliases')

mkdirSync(aliasesDir, { recursive: true })

const FUNCTION_BODY_PATTERN = /\(\)\{|; unset -f/

let generated = 0
let skippedAliases = 0

for (const [name, { description, aliases }] of Object.entries(ALIAS_PLUGIN_DATA)) {
  const filteredEntries = Object.entries(aliases).filter(([, value]) => {
    if (FUNCTION_BODY_PATTERN.test(value)) {
      skippedAliases++
      return false
    }
    return true
  })

  if (filteredEntries.length === 0) {
    process.stderr.write(`Warning: ${name} has no valid aliases after filtering, skipping\n`)
    continue
  }

  const aliasLines = filteredEntries
    .map(([key, value]) => `    ${JSON.stringify(key)}: ${JSON.stringify(value)},`)
    .join('\n')

  const content = `import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: ${JSON.stringify(name)},
  version: '1.0.0',
  description: ${JSON.stringify(description)},
  aliases: {
${aliasLines}
  },
}
`

  writeFileSync(join(aliasesDir, `${name}.ts`), content)
  generated++
}

process.stdout.write(`Generated ${generated} alias plugin files in src/plugins/aliases/\n`)
if (skippedAliases > 0) {
  process.stdout.write(`Skipped ${skippedAliases} function-body aliases\n`)
}
