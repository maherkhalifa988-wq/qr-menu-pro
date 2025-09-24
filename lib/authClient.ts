// lib/authClient.ts
'use client'

import { setStoredRole, type Role } from './role'

export async function signInWithPasscode(code: string): Promise<Role> {
  const pass = (code ?? '').trim()
  if (!pass) throw new Error('EMPTY_CODE')

  const url = new URL('/api/passcode', location.origin)
  url.search = new URLSearchParams({ code: pass }).toString()

  const res = await fetch(url.toString(), { method: 'GET', cache: 'no-store' })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) throw new Error(data?.error || 'LOGIN_FAILED')

  const role = data?.role as Role | undefined
  if (role !== 'admin' && role !== 'editor') throw new Error('NO_ROLE')

  // نخزن الدور محلياً
  setStoredRole(role)
  // (اختياري) لو عندك token وتحتاجه لاحقًا، خزنّه هنا أيضًا.
  return role
}
