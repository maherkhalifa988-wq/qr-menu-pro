// app/login/page.tsx
'use client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signInWithPasscode } from '@/lib/authClient'

export default function LoginPage() {
  const router = useRouter()
  const search = useSearchParams()
  const toParam = search?.get('to') ?? '' // قد يكون فارغ

  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    const code = pass.trim()
    if (!code) return setErr('أدخل كلمة المرور')

    setLoading(true)
    try {
      const role = await signInWithPasscode(code)
      const dest = toParam || (role === 'admin' ? '/admin' : '/editor')
      router.replace(dest)
    } catch (ex: any) {
      console.error('LOGIN_ERROR', ex)
      setErr(ex?.message || 'فشل الدخول')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto p-6 max-w-md">
      <h1 className="text-2xl font-bold mb-4">تسجيل الدخول</h1>
      <form onSubmit={onSubmit} className="card p-4 space-y-4">
        <input
          className="input w-full"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="أدخل كلمة المرور"
          autoFocus
        />
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button className="btn w-full" disabled={loading}>
          {loading ? '...جارٍ الدخول' : 'دخول'}
        </button>
      </form>
    </main>
  )
}
