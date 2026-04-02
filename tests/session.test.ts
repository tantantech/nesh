import { describe, it, expect } from 'vitest'
import { createSessionId, buildResumeOptions, extractSessionId } from '../src/session.js'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

describe('createSessionId', () => {
  it('returns a valid UUID v4 string', () => {
    const id = createSessionId()
    expect(id).toMatch(UUID_REGEX)
  })

  it('returns unique IDs on each call', () => {
    const id1 = createSessionId()
    const id2 = createSessionId()
    expect(id1).not.toBe(id2)
  })
})

describe('buildResumeOptions', () => {
  it('returns empty object when sessionId is undefined', () => {
    const result = buildResumeOptions(undefined)
    expect(result).toEqual({})
  })

  it('returns { resume: sessionId } when sessionId is provided', () => {
    const result = buildResumeOptions('some-session-id')
    expect(result).toEqual({ resume: 'some-session-id' })
  })
})

describe('extractSessionId', () => {
  it('extracts session_id from result message', () => {
    const result = extractSessionId({ session_id: 'abc-123' })
    expect(result).toBe('abc-123')
  })
})
