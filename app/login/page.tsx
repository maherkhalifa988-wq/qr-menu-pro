'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signInWithPasscode } from '@/lib/authClient'

export default function LoginPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const to = sp?.get('to') ?? '/'   // وجهة الرجوع بعد النجاح

  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithPasscode(pass)  // يحدد الدور داخليًا
      router.push(to)                 // ✅ string واضح
    } catch (err: any) {
      console.error('LOGIN_ERROR', err)
      alert(`فشل الدخول: ${err?.message || err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">تسجيل الدخول</h1>
      <form onSubmit={onSubmit} className="space-y-3 max-w-sm">
        <input
          className="input w-full"
          placeholder="أدخل كلمة المرور"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          type="password"
        />
        <button className="btn" disabled={loading}>
          {loading ? '...جارٍ التحقق' : 'دخول'}
        </button>
      </form>
    </main>
  )
}
