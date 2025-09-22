// lib/authClient.ts
'use client'
import { getAuth, signInWithCustomToken } from 'firebase/auth'
import { app } from './firebase'

export async function signInWithPasscode(code: string): Promise<'admin' | 'editor'> {
  const pass = (code ?? '').trim()
  if (!pass) throw new Error('EMPTY_CODE')

  const res = await fetch('/api/passcode?code=${encodeURIComponent(pass)}', {
    method: 'GET',
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error('PASSCODE_HTTP_${res.status}: ${text}')
  }

  const data = await res.json()
  const token: string = data.token
  const role: 'admin' | 'editor' = data.role

  if (!token || !role) throw new Error('INVALID_API_RESPONSE')

  const auth = getAuth(app)
  await signInWithCustomToken(auth, token)

  return role
}
