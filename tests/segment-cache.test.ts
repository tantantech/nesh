import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SegmentCache } from '../src/segment-cache.js'

describe('SegmentCache', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns undefined for missing key', () => {
    const cache = new SegmentCache(2000)
    expect(cache.get('missing')).toBeUndefined()
  })

  it('stores and retrieves a value within TTL', () => {
    const cache = new SegmentCache(2000)
    cache.set('key1', 'value1')
    expect(cache.get('key1')).toBe('value1')
  })

  it('returns undefined after TTL expires', () => {
    const cache = new SegmentCache(2000)
    cache.set('key1', 'value1')
    vi.advanceTimersByTime(2001)
    expect(cache.get('key1')).toBeUndefined()
  })

  it('returns value just before TTL expires', () => {
    const cache = new SegmentCache(2000)
    cache.set('key1', 'value1')
    vi.advanceTimersByTime(1999)
    expect(cache.get('key1')).toBe('value1')
  })

  it('supports custom TTL override per entry', () => {
    const cache = new SegmentCache(2000)
    cache.set('short', 'val', 500)
    vi.advanceTimersByTime(501)
    expect(cache.get('short')).toBeUndefined()
  })

  it('clear() empties all entries', () => {
    const cache = new SegmentCache(2000)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.clear()
    expect(cache.get('a')).toBeUndefined()
    expect(cache.get('b')).toBeUndefined()
  })

  it('overwrites existing key with new value and resets TTL', () => {
    const cache = new SegmentCache(2000)
    cache.set('k', 'old')
    vi.advanceTimersByTime(1500)
    cache.set('k', 'new')
    vi.advanceTimersByTime(1500)
    expect(cache.get('k')).toBe('new')
  })
})
