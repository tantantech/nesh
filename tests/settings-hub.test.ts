import { describe, it, expect, vi, beforeEach } from 'vitest'

function createMockRl(inputs: string[]) {
  let callIndex = 0
  return {
    question: vi.fn(async () => {
      const input = inputs[callIndex] ?? 'q'
      callIndex++
      return input
    }),
  } as unknown as import('node:readline/promises').Interface
}

describe('Settings Hub', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('exits on q from main menu', async () => {
    const { executeSettings } = await import('../src/settings.js')
    const rl = createMockRl(['q'])
    const result = await executeSettings(rl, {})
    expect(result).toEqual({})
  })

  it('enters appearance and exits back to main then exits', async () => {
    const { executeSettings } = await import('../src/settings.js')
    const rl = createMockRl(['1', 'q', 'q'])
    const result = await executeSettings(rl, {})
    expect(result).toEqual({})
  })

  it('enters shell and exits back to main then exits', async () => {
    const { executeSettings } = await import('../src/settings.js')
    const rl = createMockRl(['4', 'q', 'q'])
    const result = await executeSettings(rl, {})
    expect(result).toEqual({})
  })

  it('re-prompts on invalid input', async () => {
    const { executeSettings } = await import('../src/settings.js')
    const rl = createMockRl(['99', 'abc', 'q'])
    const result = await executeSettings(rl, {})
    expect(result).toEqual({})
    // Should have been called 3 times (99, abc, q)
    expect(rl.question).toHaveBeenCalledTimes(3)
  })
})
