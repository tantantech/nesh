import type { UsageInfo, CostAccumulator } from './types.js'

export const EMPTY_ACCUMULATOR: CostAccumulator = {
  totalCostUsd: 0,
  totalInputTokens: 0,
  totalOutputTokens: 0,
  messageCount: 0,
}

export function extractUsage(msg: {
  readonly usage: { readonly input_tokens: number; readonly output_tokens: number }
  readonly total_cost_usd: number
  readonly duration_ms: number
}): UsageInfo {
  return {
    inputTokens: msg.usage.input_tokens,
    outputTokens: msg.usage.output_tokens,
    costUsd: msg.total_cost_usd,
    durationMs: msg.duration_ms,
  }
}

export function accumulate(acc: CostAccumulator, usage: UsageInfo): CostAccumulator {
  return {
    totalCostUsd: acc.totalCostUsd + usage.costUsd,
    totalInputTokens: acc.totalInputTokens + usage.inputTokens,
    totalOutputTokens: acc.totalOutputTokens + usage.outputTokens,
    messageCount: acc.messageCount + 1,
  }
}

function formatCostShort(cost: number): string {
  return cost < 0.01 ? `$${cost.toFixed(4)}` : `$${cost.toFixed(2)}`
}

function formatCostPrecise(cost: number): string {
  return cost < 1 ? `$${cost.toFixed(4)}` : `$${cost.toFixed(2)}`
}

export function formatUsage(usage: UsageInfo): string {
  const inK = (usage.inputTokens / 1000).toFixed(1)
  const outK = (usage.outputTokens / 1000).toFixed(1)
  return `tokens: ${inK}k in / ${outK}k out | cost: ${formatCostShort(usage.costUsd)}`
}

export function formatSessionCost(acc: CostAccumulator): string {
  return `session: ${formatCostPrecise(acc.totalCostUsd)} (${acc.messageCount} messages)`
}
