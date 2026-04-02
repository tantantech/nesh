import { describe, it, expect } from 'vitest'
import {
  EMPTY_ACCUMULATOR,
  extractUsage,
  accumulate,
  formatUsage,
  formatSessionCost,
} from '../src/cost.js'
import type { UsageInfo } from '../src/types.js'

describe('EMPTY_ACCUMULATOR', () => {
  it('has all zero fields', () => {
    expect(EMPTY_ACCUMULATOR).toEqual({
      totalCostUsd: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      messageCount: 0,
    })
  })
})

describe('extractUsage', () => {
  it('extracts usage info from SDK result message shape', () => {
    const msg = {
      usage: { input_tokens: 100, output_tokens: 50 },
      total_cost_usd: 0.003,
      duration_ms: 1500,
    }
    const result = extractUsage(msg)
    expect(result).toEqual({
      inputTokens: 100,
      outputTokens: 50,
      costUsd: 0.003,
      durationMs: 1500,
    })
  })
})

describe('accumulate', () => {
  const usage: UsageInfo = {
    inputTokens: 1000,
    outputTokens: 500,
    costUsd: 0.005,
    durationMs: 1200,
  }

  it('accumulates a single usage into empty accumulator', () => {
    const result = accumulate(EMPTY_ACCUMULATOR, usage)
    expect(result).toEqual({
      totalCostUsd: 0.005,
      totalInputTokens: 1000,
      totalOutputTokens: 500,
      messageCount: 1,
    })
  })

  it('accumulates two usages correctly', () => {
    const first = accumulate(EMPTY_ACCUMULATOR, usage)
    const second = accumulate(first, {
      inputTokens: 2000,
      outputTokens: 1000,
      costUsd: 0.010,
      durationMs: 800,
    })
    expect(second).toEqual({
      totalCostUsd: 0.015,
      totalInputTokens: 3000,
      totalOutputTokens: 1500,
      messageCount: 2,
    })
  })

  it('does not mutate the original accumulator', () => {
    const original = { ...EMPTY_ACCUMULATOR }
    accumulate(EMPTY_ACCUMULATOR, usage)
    expect(EMPTY_ACCUMULATOR).toEqual(original)
  })
})

describe('formatUsage', () => {
  it('formats small cost with 4 decimal places', () => {
    const result = formatUsage({
      inputTokens: 1000,
      outputTokens: 500,
      costUsd: 0.005,
      durationMs: 1200,
    })
    expect(result).toBe('tokens: 1.0k in / 0.5k out | cost: $0.0050')
  })

  it('formats cost >= 0.01 with 2 decimal places', () => {
    const result = formatUsage({
      inputTokens: 10000,
      outputTokens: 5000,
      costUsd: 0.05,
      durationMs: 3000,
    })
    expect(result).toBe('tokens: 10.0k in / 5.0k out | cost: $0.05')
  })
})

describe('formatSessionCost', () => {
  it('formats session cost with message count', () => {
    const result = formatSessionCost({
      totalCostUsd: 0.025,
      totalInputTokens: 5000,
      totalOutputTokens: 2500,
      messageCount: 3,
    })
    expect(result).toBe('session: $0.0250 (3 messages)')
  })

  it('formats large session cost with 2 decimal places', () => {
    const result = formatSessionCost({
      totalCostUsd: 1.50,
      totalInputTokens: 100000,
      totalOutputTokens: 50000,
      messageCount: 20,
    })
    expect(result).toBe('session: $1.50 (20 messages)')
  })
})
