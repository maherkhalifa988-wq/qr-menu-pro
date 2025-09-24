// lib/authClient.ts
'use client'

import { getAuth, signInWithCustomToken } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export function getStoredRole(): 'admin' | 'editor' | null {
  try {
    const r = localStorage.getItem('role')
    if (r === 'admin' || r === 'editor') return r
    return null
  } catch {
    return null
  }
}

function setStoredRole(role: 'admin' | 'editor') {
  try { localStorage.setItem('role', role) } catch {}
}

export async function signInWithPasscode(code: string): Promise<'admin' | 'editor'> {
  const pass = (code ?? '').trim()
  if (!pass) throw new Error('EMPTY_CODE')

  // نادِ API للتحقق من الرمز وإرجاع الدور + (اختياري) توكن مخصص
  const url = new URL('/api/passcode', location.origin)
  url.search = new URLSearchParams({ code: pass }).toString()

  const res = await fetch(url.toString(), { method: 'GET', cache: 'no-store' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)

  // إذا API يرجّع token (اختياري)، سجل دخول Firebase
  if (data?.token) {
    const a = getAuth()
    await signInWithCustomToken(a, data.token)
  }

  const role: 'admin' | 'editor' = data?.role
  if (role !== 'admin' && role !== 'editor') throw new Error('NO_ROLE')

  setStoredRole(role)
  return role
}
