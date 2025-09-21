export async function signInWithPasscode(code: string): Promise<'admin' | 'editor'> {
  const res = await fetch('/api/passcode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: (code || '').trim() }),
  })
  if (!res.ok) throw new Error('invalid')
  const data = (await res.json()) as { role: 'admin' | 'editor' }
  if (typeof window !== 'undefined') localStorage.setItem('role', data.role)
  return data.role
}
