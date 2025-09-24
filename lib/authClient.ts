// lib/authClient.ts
'use client'
import { getAuth, signInWithCustomToken } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { setStoredRole } from '@/lib/role'

export async function signInWithPasscode(code: string): Promise<'admin'|'editor'> {
  const pass = (code ?? '').trim()
  if (!pass) throw new Error('EMPTY_CODE')

  const url = new URL('/api/passcode', location.origin)
  url.search = new URLSearchParams({ code: pass }).toString()

  const res = await fetch(url.toString(), { method: 'GET', cache: 'no-store' })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || 'Invalid passcode')

  const { role, token } = data as { role: 'admin'|'editor', token?: string }

  // إن كان لديك backend يعيد custom token:
  if (token) {
    const fa = getAuth(auth.app)
    await signInWithCustomToken(fa, token)
  }

  setStoredRole(role)
  return role
}
