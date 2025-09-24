// lib/authClient.ts
export async function signInWithPasscode(passcode: string): Promise<'admin' | 'editor'> {
  const res = await fetch('/api/passcode', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ passcode }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data?.ok || !data?.role) {
    throw new Error(data?.error || 'PASSCODE_HTTP_' + res.status)
  }
  localStorage.setItem('role', data.role)
  return data.role as 'admin' | 'editor'
}

export function getStoredRole(): 'admin' | 'editor' | null {
  if (typeof window === 'undefined') return null
  const r = localStorage.getItem('role')
  return r === 'admin' || r === 'editor' ? r : null
}

export function clearRole() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('role')
}
