'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signInWithPasscode } from '@/lib/authClient'

export default function LoginPage() {
  const router = useRouter()
  const search = useSearchParams()
  const to = search?.get('to') || '/'

  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    try {
      await signInWithPasscode(pass) // يُخزن الدور محليًا وربما يوقّع Firebase بتوكن API
      router.replace(to)             // ارجاع إلى الصفحة المطلوبة
    } catch (error: any) {
      console.error('LOGIN_ERROR', error)
      setErr(error?.message || 'فشل تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto p-6 max-w-md">
      <h1 className="text-2xl font-bold mb-4">تسجيل الدخول</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          className="input w-full"
          type="password"
          placeholder="أدخل كلمة المرور"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          autoFocus
        />
        <button className="btn w-full" disabled={loading}>
          {loading ? '...جارٍ التحقق' : 'دخول'}
        </button>
        {err && <p className="text-red-400 text-sm">{err}</p>}
      </form>

      <p className="text-white/60 text-xs mt-4">
        سيتم تحويلك إلى: <code className="bg-white/10 px-2 py-0.5 rounded">{to}</code>
      </p>
    </main>
  )
}
