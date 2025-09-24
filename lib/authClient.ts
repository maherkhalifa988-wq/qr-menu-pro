'use client'

import { auth } from '@/lib/firebase'
import { signInWithCustomToken } from 'firebase/auth'
import { setStoredRole } from './role'

export async function signInWithPasscode(code: string): Promise<'admin'|'editor'> {
  const pass = (code ?? '').trim()
  if (!pass) throw new Error('EMPTY_CODE')

  // استدعاء الـ API من نفس الدومين
  const url = new URL('/api/passcode', location.origin)
  url.search = new URLSearchParams({ code: pass }).toString()

  const res = await fetch(url.toString(), { method: 'GET', cache: 'no-store' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || 'Bad passcode')

  const role = data?.role as 'admin'|'editor'
  if (!role) throw new Error('No role returned')

  // إن رجع توكن – نسجّل دخول Firebase (اختياري لكن مفيد لقواعد Firestore)
  const token = data?.token as string | undefined
  if (token) {
    await signInWithCustomToken(auth, token)
  }

  setStoredRole(role)
  return role
}
