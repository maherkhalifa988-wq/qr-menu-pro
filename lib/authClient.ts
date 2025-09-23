// lib/authClient.ts
'use client'

import { signInWithCustomToken } from 'firebase/auth'
import { auth } from './firebase'

export async function signInWithPasscode(code: string): Promise<'admin' | 'editor'> {
  const pass = (code ?? '').trim()
  if (!pass) throw new Error('EMPTY_CODE')

  // ✅ بناء الرابط باستخدام URLSearchParams
  const url = new URL('/api/passcode', location.origin)
  url.search = new URLSearchParams({ code: pass }).toString()

  const res = await fetch(url.toString(), {
    method: 'GET',
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error('PASSCODE_HTTP_${res.status}: ${text}')
  }

  const { token, role } = await res.json()
  if (!token || !role) throw new Error('INVALID_RESPONSE')

  // ✅ تسجيل الدخول باستخدام Firebase
  await signInWithCustomToken(auth, token)

  return role
}
