'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { signInWithPasscode } from '@/lib/authClient'

export default function LoginPage() {
  const router = useRouter()
  const q = useSearchParams()
  const to = q.get('to') || '/'
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const role = await signInWithPasscode(pass)
      // إن كانت الوجهة /admin والدور ليس أدمن → حوّل للمحرر
      if (to.startsWith('/admin') && role !== 'admin') {
        router.replace('/editor')
      } else {
        router.replace(to)
      }
    } catch (err: any) {
      alert(`خطأ: ${err?.message ?? err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">تسجيل الدخول</h1>
      <form onSubmit={onSubmit} className="max-w-sm space-y-3">
        <input
          type="password"
          className="input w-full"
          placeholder="أدخل كلمة السر"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
        <button className="btn" disabled={loading}>
          {loading ? '...جاري التحقق' : 'دخول'}
        </button>
      </form>
    </main>
  )
}
