// lib/authClient.ts
export async function signInWithPasscode(code: string): Promise<'admin' | 'editor'> {
  const pass = (code ?? '').trim();
  if (!pass) throw new Error('EMPTY_CODE');

  const res = await fetch('/api/passcode?code=${encodeURIComponent(pass)}', {
    method: 'GET',
    cache: 'no-store',
  });

  if (!res.ok) {
    let msg = 'HTTP ${res.status}';
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch {}
    throw new Error(msg);
  }

  const data = await res.json();
  const role = data?.role as 'admin' | 'editor' | undefined;
  if (role !== 'admin' && role !== 'editor') throw new Error('INVALID_RESPONSE');
  return role;
}
