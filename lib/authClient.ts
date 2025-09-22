// lib/authClient.ts
export async function signInWithPasscode(code: string): Promise<'admin' | 'editor'> {
  const pass = (code ?? '').trim();
  if (!pass) throw new Error('EMPTY_CODE');

  const url = `/api/passcode?code=${encodeURIComponent(pass)}`;
  console.log('[authClient] calling', url);

  const res = await fetch(url, { method: 'GET', cache: 'no-store' });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch {}
    console.error('[authClient] fetch failed:', msg);
    throw new Error(msg);
  }

  const data = await res.json().catch(() => ({} as any));
  console.log('[authClient] response:', data);

  const role = data?.role as 'admin' | 'editor' | undefined;
  if (role !== 'admin' && role !== 'editor') {
    throw new Error('NO_ROLE_RETURNED');
  }
  return role;
}

// Debug helper (optional; remove later)
;(globalThis as any).testPass = signInWithPasscode;
