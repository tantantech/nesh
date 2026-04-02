import { randomUUID } from 'node:crypto'

export function createSessionId(): string {
  return randomUUID()
}

export function buildResumeOptions(sessionId: string | undefined): { resume?: string } {
  return sessionId ? { resume: sessionId } : {}
}

export function extractSessionId(resultMessage: { readonly session_id: string }): string {
  return resultMessage.session_id
}
