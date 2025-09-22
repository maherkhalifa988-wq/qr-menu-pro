// lib/authClient.ts
export async function signInWithPasscode(code: string): Promise<'admin' | 'editor'> {
  const pass = (code ?? '').trim();
  if (!pass) throw new Error('EMPTY_CODE');

  const res = await fetch(/api/passcode?code=${encodeURIComponent(pass)}, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!res.ok) {
    // 401 -> invalid, أي كود آخر -> مشكلة سيرفر
    const text = await res.text().catch(() => '');
    throw new Error(PASSCODE_HTTP_${res.status}: ${text});
  }

  const data = await res.json().catch(() => ({}));
  if (data?.role === 'admin' || data?.role === 'editor') return data.role;

  throw new Error('NO_ROLE_RETURNED');
}
