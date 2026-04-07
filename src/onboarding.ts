import pc from 'picocolors'
import fs from 'node:fs'
import * as readline from 'node:readline/promises'
import { loadConfig, saveConfig, ensureConfigDir, CONFIG_PATH } from './config.js'
import { PROVIDER_DISPLAY_NAMES, PROVIDER_CONFIGS, listModels } from './providers/index.js'
import type { NeshConfig, ProviderKeys } from './config.js'

const PROVIDER_TIERS: ReadonlyArray<{ readonly label: string; readonly providers: readonly string[] }> = [
  { label: 'Big Tech',            providers: ['claude', 'openai', 'google'] },
  { label: 'Major AI Companies',  providers: ['xai', 'deepseek', 'mistral', 'cohere', 'minimax'] },
  { label: 'Fast Inference',      providers: ['groq', 'together', 'fireworks'] },
  { label: 'Aggregators / Local', providers: ['openrouter', 'ollama', 'perplexity'] },
]

const PERMISSION_OPTIONS = ['auto', 'ask', 'deny'] as const

const PROFILE_OPTIONS: ReadonlyArray<{ readonly name: string; readonly description: string }> = [
  { name: 'core',        description: 'Git aliases only (minimal)' },
  { name: 'developer',   description: 'Git, npm, docker, extract, copypath, jsontools' },
  { name: 'devops',      description: 'Developer + kubectl, cloud CLIs, sysadmin tools' },
  { name: 'cloud',       description: 'Developer + AWS, GCloud, Azure completions' },
  { name: 'ai-engineer', description: 'Developer + Python/pip, encode64, jsontools' },
  { name: 'none',        description: 'No plugins (configure manually later)' },
]

export function isFirstRun(): boolean {
  return !fs.existsSync(CONFIG_PATH)
}

export interface OnboardingResult {
  readonly model?: string
  readonly prefix: string
  readonly permissions: 'auto' | 'ask' | 'deny'
  readonly profile: string
}

export async function runOnboarding(rl: readline.Interface): Promise<OnboardingResult> {
  process.stdout.write('\n')
  process.stdout.write(pc.bold('  Welcome to Nesh!\n'))
  process.stdout.write(pc.dim('  Let\'s set up your AI-native shell.\n\n'))
  process.stdout.write(pc.dim('  ─────────────────────────────────────\n\n'))

  // Step 1: API key
  const keys = await stepApiKey(rl)

  // Step 2: Default model
  const model = await stepModel(rl, keys)

  // Step 3: AI prefix
  const prefix = await stepPrefix(rl)

  // Step 4: Permission mode
  const permissions = await stepPermissions(rl)

  // Step 5: Plugin profile
  const profile = await stepProfile(rl)

  // Save config
  const existing = loadConfig()
  const finalConfig: NeshConfig = {
    ...existing,
    ...(keys ? { keys: { ...existing.keys, ...keys } } : {}),
    ...(model ? { model } : {}),
    prefix,
    permissions,
  }

  ensureConfigDir()
  saveConfig(finalConfig)

  process.stdout.write('\n')
  process.stdout.write(pc.dim('  ─────────────────────────────────────\n\n'))
  process.stdout.write(pc.bold('  Setup complete!\n\n'))
  process.stdout.write(`  Config: ${pc.dim(CONFIG_PATH)}\n`)
  process.stdout.write(`  Model:  ${pc.bold(model ?? 'claude-sonnet (default)')}\n`)
  process.stdout.write(`  Prefix: ${pc.bold(prefix)}\n`)
  process.stdout.write(`  Perms:  ${pc.bold(permissions)}\n`)
  if (profile !== 'none') {
    process.stdout.write(`  Profile: ${pc.bold(profile)}\n`)
  }
  process.stdout.write('\n')
  process.stdout.write(pc.dim('  Tip: Run `theme` to customize your prompt style.\n'))
  process.stdout.write(pc.dim('  Tip: Run `settings` to change any of these later.\n\n'))

  return { model, prefix, permissions, profile }
}

async function stepApiKey(rl: readline.Interface): Promise<ProviderKeys | undefined> {
  process.stdout.write(pc.bold('  Step 1/5: API Key\n\n'))
  process.stdout.write('  Which AI provider do you want to use?\n\n')

  let index = 0
  const providerList: string[] = []

  for (const tier of PROVIDER_TIERS) {
    process.stdout.write(`  ${pc.dim(`── ${tier.label} ──`)}\n`)
    for (const provider of tier.providers) {
      index++
      providerList.push(provider)
      const displayName = PROVIDER_DISPLAY_NAMES[provider] ?? provider
      const cfg = PROVIDER_CONFIGS[provider]
      const envVar = cfg?.apiKeyEnv
      const hasEnv = envVar ? Boolean(process.env[envVar]) : false
      const envHint = hasEnv ? pc.green(' (found in env)') : ''
      const noKey = provider === 'ollama' ? pc.dim(' (no key needed)') : ''
      process.stdout.write(`    [${index}] ${displayName}${envHint}${noKey}\n`)
    }
  }

  process.stdout.write('\n')
  const answer = await rl.question('  Select provider (1-' + index + ') [1]: ')
  const num = parseInt(answer.trim(), 10)
  const selectedIndex = (isNaN(num) ? 1 : num) - 1

  if (selectedIndex < 0 || selectedIndex >= providerList.length) {
    process.stdout.write('  Using default (Anthropic/Claude).\n\n')
    return undefined
  }

  const providerName = providerList[selectedIndex]
  const displayName = PROVIDER_DISPLAY_NAMES[providerName] ?? providerName
  const cfg = PROVIDER_CONFIGS[providerName]
  const envVar = cfg?.apiKeyEnv ?? ''
  const hasEnv = envVar ? Boolean(process.env[envVar]) : false

  if (providerName === 'ollama') {
    process.stdout.write(`  ${displayName} selected (no API key needed).\n\n`)
    return undefined
  }

  if (hasEnv) {
    process.stdout.write(`  ${displayName} key found in environment (${envVar}).\n\n`)
    return undefined
  }

  const keyValue = await rl.question(`  Enter ${displayName} API key: `)
  const trimmed = keyValue.trim()

  if (!trimmed) {
    process.stdout.write('  No key entered. Add one later with `keys` command.\n\n')
    return undefined
  }

  process.stdout.write(`  Key saved.\n\n`)
  return { [providerName]: trimmed }
}

async function stepModel(rl: readline.Interface, keys?: ProviderKeys): Promise<string | undefined> {
  process.stdout.write(pc.bold('  Step 2/5: Default Model\n\n'))

  const availableProviders = new Set<string>()
  if (keys) {
    for (const [k, v] of Object.entries(keys)) {
      if (v) availableProviders.add(k)
    }
  }
  for (const [name, cfg] of Object.entries(PROVIDER_CONFIGS)) {
    if (cfg.apiKeyEnv && process.env[cfg.apiKeyEnv]) {
      availableProviders.add(name)
    }
  }

  const models = listModels()
  const filtered = availableProviders.size > 0
    ? models.filter(m => availableProviders.has(m.entry.provider))
    : models

  if (filtered.length === 0) {
    process.stdout.write('  No models available for configured providers. Using default.\n\n')
    return undefined
  }

  const toShow = filtered.slice(0, 10)
  for (let i = 0; i < toShow.length; i++) {
    const m = toShow[i]
    const providerLabel = PROVIDER_DISPLAY_NAMES[m.entry.provider] ?? m.entry.provider
    process.stdout.write(`    [${i + 1}] ${m.entry.displayName} ${pc.dim(`(${providerLabel})`)}\n`)
  }
  process.stdout.write('\n')

  const answer = await rl.question(`  Select model (1-${toShow.length}) [1]: `)
  const num = parseInt(answer.trim(), 10)
  const idx = (isNaN(num) ? 1 : num) - 1

  if (idx < 0 || idx >= toShow.length) {
    const def = toShow[0]
    process.stdout.write(`  Using ${def.entry.displayName}.\n\n`)
    return def.shorthand
  }

  const selected = toShow[idx]
  process.stdout.write(`  Model: ${selected.entry.displayName}\n\n`)
  return selected.shorthand
}

async function stepPrefix(rl: readline.Interface): Promise<string> {
  process.stdout.write(pc.bold('  Step 3/5: AI Prefix\n\n'))
  process.stdout.write(pc.dim('  Type this before AI commands (e.g., "a summarize this file").\n\n'))

  const answer = await rl.question('  AI prefix [a]: ')
  const trimmed = answer.trim()

  if (!trimmed || /\s/.test(trimmed)) {
    process.stdout.write('  Using default: a\n\n')
    return 'a'
  }

  process.stdout.write(`  Prefix: ${trimmed}\n\n`)
  return trimmed
}

async function stepPermissions(rl: readline.Interface): Promise<'auto' | 'ask' | 'deny'> {
  process.stdout.write(pc.bold('  Step 4/5: AI Permissions\n\n'))
  process.stdout.write('  What can AI do without asking?\n\n')
  process.stdout.write('    [1] auto — approve all file edits and commands\n')
  process.stdout.write('    [2] ask  — prompt before each action\n')
  process.stdout.write('    [3] deny — AI can suggest but not execute\n\n')

  const answer = await rl.question('  Select (1-3) [1]: ')
  const num = parseInt(answer.trim(), 10)
  const idx = (isNaN(num) ? 1 : num) - 1

  if (idx < 0 || idx >= PERMISSION_OPTIONS.length) {
    process.stdout.write('  Using auto.\n\n')
    return 'auto'
  }

  process.stdout.write(`  Permissions: ${PERMISSION_OPTIONS[idx]}\n\n`)
  return PERMISSION_OPTIONS[idx]
}

async function stepProfile(rl: readline.Interface): Promise<string> {
  process.stdout.write(pc.bold('  Step 5/5: Plugin Profile\n\n'))
  process.stdout.write('  Choose a preset to enable plugins:\n\n')

  for (let i = 0; i < PROFILE_OPTIONS.length; i++) {
    const p = PROFILE_OPTIONS[i]
    process.stdout.write(`    [${i + 1}] ${pc.bold(p.name)} — ${p.description}\n`)
  }
  process.stdout.write('\n')

  const answer = await rl.question(`  Select profile (1-${PROFILE_OPTIONS.length}) [2]: `)
  const num = parseInt(answer.trim(), 10)
  const idx = (isNaN(num) ? 2 : num) - 1

  if (idx < 0 || idx >= PROFILE_OPTIONS.length) {
    process.stdout.write('  Using developer profile.\n\n')
    return 'developer'
  }

  process.stdout.write(`  Profile: ${PROFILE_OPTIONS[idx].name}\n\n`)
  return PROFILE_OPTIONS[idx].name
}
