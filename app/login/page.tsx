'use client'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signInWithPasscode } from '@/lib/authClient'

export default function LoginPage() {
  const router = useRouter()
  const search = useSearchParams()
  const to = search?.get('to') || '/admin'

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // لو مسجّل من قبل، وجّه مباشرة
    const role = (typeof window !== 'undefined' && localStorage.getItem('role')) || ''
    if (role === 'admin' || role === 'editor') {
      router.replace(to)
    }
  }, [router, to])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setLoading(true)
      const role = await signInWithPasscode(code)
      localStorage.setItem('role', role)
      router.replace(to)
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
      <form onSubmit={onSubmit} className="card p-4 space-y-3">
        <input
          className="input w-full"
          placeholder="أدخل كلمة المرور"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button className="btn" disabled={loading}>
          {loading ? 'جاري التحقق…' : 'دخول'}
        </button>
      </form>
    </main>
  )
}
