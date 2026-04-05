import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createKeypressHandler } from '../../src/suggestions/keypress.js'

// Mock the renderer module
vi.mock('../../src/suggestions/renderer.js', () => ({
  renderGhost: vi.fn(),
  clearGhost: vi.fn(),
  hasGhost: vi.fn(() => false),
}))

// Mock the history-search module
vi.mock('../../src/suggestions/history-search.js', () => ({
  findSuggestion: vi.fn(() => null),
}))

import { renderGhost, clearGhost } from '../../src/suggestions/renderer.js'
import { findSuggestion } from '../../src/suggestions/history-search.js'

function createMockRl(line = '', cursor = 0) {
  return {
    line,
    cursor,
    write: vi.fn(),
  } as unknown as import('node:readline/promises').Interface
}

describe('createKeypressHandler', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns a function', () => {
    const rl = createMockRl()
    const handler = createKeypressHandler(rl, [], [], 50)
    expect(typeof handler).toBe('function')
  })

  it('calls clearGhost on every keypress', () => {
    const rl = createMockRl('g', 1)
    const handler = createKeypressHandler(rl, ['git status'], [], 50)
    handler('g', { name: 'g', sequence: 'g' } as any)
    expect(clearGhost).toHaveBeenCalled()
  })

  it('schedules findSuggestion after debounce and renders ghost on match', () => {
    const rl = createMockRl('git', 3)
    const history = ['git status', 'ls -la']
    const handler = createKeypressHandler(rl, history, [], 50)

    vi.mocked(findSuggestion).mockReturnValue('git status')

    handler('t', { name: 't', sequence: 't' } as any)

    // Before debounce: findSuggestion not called yet
    expect(findSuggestion).not.toHaveBeenCalled()

    // After debounce
    vi.advanceTimersByTime(50)

    expect(findSuggestion).toHaveBeenCalledWith('git', history, [])
    expect(renderGhost).toHaveBeenCalledWith(' status')
  })

  it('accepts suggestion with right-arrow when cursor is at end of line', () => {
    const rl = createMockRl('git', 3)
    const history = ['git status']
    const handler = createKeypressHandler(rl, history, [], 50)

    // First, trigger a suggestion
    vi.mocked(findSuggestion).mockReturnValue('git status')
    handler('t', { name: 't', sequence: 't' } as any)
    vi.advanceTimersByTime(50)

    vi.clearAllMocks()

    // Now press right-arrow at end of line
    handler('\x1b[C', { name: 'right', sequence: '\x1b[C' } as any)

    expect(clearGhost).toHaveBeenCalled()
    expect(rl.write).toHaveBeenCalledWith(' status')
  })

  it('does NOT accept suggestion with right-arrow when cursor is mid-line', () => {
    const rl = createMockRl('git', 2) // cursor at position 2 (mid-line)
    const history = ['git status']
    const handler = createKeypressHandler(rl, history, [], 50)

    // Trigger a suggestion
    vi.mocked(findSuggestion).mockReturnValue('git status')
    // Temporarily set cursor to end for suggestion to activate
    ;(rl as any).cursor = 3
    ;(rl as any).line = 'git'
    handler('t', { name: 't', sequence: 't' } as any)
    vi.advanceTimersByTime(50)

    vi.clearAllMocks()

    // Move cursor to mid-line, then press right-arrow
    ;(rl as any).cursor = 2
    handler('\x1b[C', { name: 'right', sequence: '\x1b[C' } as any)

    // Should NOT write suggestion
    expect(rl.write).not.toHaveBeenCalled()
  })

  it('clears suggestion on escape', () => {
    const rl = createMockRl('git', 3)
    const handler = createKeypressHandler(rl, ['git status'], [], 50)

    // Trigger suggestion
    vi.mocked(findSuggestion).mockReturnValue('git status')
    handler('t', { name: 't', sequence: 't' } as any)
    vi.advanceTimersByTime(50)

    vi.clearAllMocks()

    // Press escape
    handler('\x1b', { name: 'escape', sequence: '\x1b' } as any)
    expect(clearGhost).toHaveBeenCalled()

    // Right-arrow should NOT accept now (suggestion cleared)
    vi.clearAllMocks()
    ;(rl as any).cursor = 3
    handler('\x1b[C', { name: 'right', sequence: '\x1b[C' } as any)
    expect(rl.write).not.toHaveBeenCalled()
  })

  it('clears suggestion on tab without scheduling new one', () => {
    const rl = createMockRl('git', 3)
    const handler = createKeypressHandler(rl, ['git status'], [], 50)

    // Trigger suggestion
    vi.mocked(findSuggestion).mockReturnValue('git status')
    handler('t', { name: 't', sequence: 't' } as any)
    vi.advanceTimersByTime(50)

    vi.clearAllMocks()

    // Press tab
    handler('\t', { name: 'tab', sequence: '\t' } as any)
    expect(clearGhost).toHaveBeenCalled()

    // Advance timers -- no new suggestion should be scheduled
    vi.advanceTimersByTime(100)
    expect(findSuggestion).not.toHaveBeenCalled()
  })

  it('clears suggestion on enter', () => {
    const rl = createMockRl('git', 3)
    const handler = createKeypressHandler(rl, ['git status'], [], 50)

    // Trigger suggestion
    vi.mocked(findSuggestion).mockReturnValue('git status')
    handler('t', { name: 't', sequence: 't' } as any)
    vi.advanceTimersByTime(50)

    vi.clearAllMocks()

    // Press enter
    handler('\r', { name: 'return', sequence: '\r' } as any)
    expect(clearGhost).toHaveBeenCalled()

    // Advance timers -- no new suggestion
    vi.advanceTimersByTime(100)
    expect(findSuggestion).not.toHaveBeenCalled()
  })

  it('debounces rapid keypresses', () => {
    const rl = createMockRl()
    const history = ['git status']
    const handler = createKeypressHandler(rl, history, [], 50)

    vi.mocked(findSuggestion).mockReturnValue('git status')

    // Type 'g', 'i', 't' rapidly
    ;(rl as any).line = 'g'
    ;(rl as any).cursor = 1
    handler('g', { name: 'g', sequence: 'g' } as any)

    vi.advanceTimersByTime(20) // not enough time

    ;(rl as any).line = 'gi'
    ;(rl as any).cursor = 2
    handler('i', { name: 'i', sequence: 'i' } as any)

    vi.advanceTimersByTime(20) // not enough time

    ;(rl as any).line = 'git'
    ;(rl as any).cursor = 3
    handler('t', { name: 't', sequence: 't' } as any)

    // Only after 50ms from last keypress
    vi.advanceTimersByTime(50)

    // findSuggestion called only once with final input
    expect(findSuggestion).toHaveBeenCalledTimes(1)
    expect(findSuggestion).toHaveBeenCalledWith('git', history, [])
  })

  it('does not render ghost when no match found', () => {
    const rl = createMockRl('xyz', 3)
    const handler = createKeypressHandler(rl, ['git status'], [], 50)

    vi.mocked(findSuggestion).mockReturnValue(null)

    handler('z', { name: 'z', sequence: 'z' } as any)
    vi.advanceTimersByTime(50)

    expect(findSuggestion).toHaveBeenCalled()
    expect(renderGhost).not.toHaveBeenCalled()
  })
})
