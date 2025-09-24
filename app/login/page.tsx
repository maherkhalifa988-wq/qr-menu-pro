// app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signInWithPasscode } from '@/lib/authClient'

export default function LoginPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const to = sp?.get('to') ?? '/'  // مسار الرجوع بعد الدخول

  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithPasscode(pass)
      router.replace(to)  // ارجع للمسار المطلوب
    } catch (err: any) {
      console.error('LOGIN_ERROR', err)
      alert(`فشل الدخول: ${err?.message || err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto p-6 max-w-md">
      <h1 className="text-2xl font-bold mb-4">تسجيل الدخول</h1>
      <form onSubmit={onSubmit} className="card p-4 flex flex-col gap-3">
        <input
          className="input"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="أدخل كلمة المرور"
          type="password"
        />
        <button className="btn" disabled={loading} type="submit">
          {loading ? 'جاري التحقق...' : 'دخول'}
        </button>
      </form>
    </main>
  )
}
