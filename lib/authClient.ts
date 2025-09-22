// lib/authClient.ts
import { getAuth, signInWithCustomToken } from 'firebase/auth'
import { app } from './firebase'

export async function signInWithPasscode(passcode: string) {
  const res = await fetch('/api/passcode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode, role: 'admin' }),
  })
  if (!res.ok) {
    let msg = 'Passcode failed'
    try { const j = await res.json(); msg = j?.error || msg } catch {}
    throw new Error(msg)
  }
  const { token, role } = await res.json()
  await signInWithCustomToken(getAuth(app), token)
  return role as 'admin' | 'editor'
}
