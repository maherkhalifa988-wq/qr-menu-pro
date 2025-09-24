// app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signInWithPasscode } from '@/lib/authClient'

export const dynamic = 'force-static' // لا نحتاج بيانات وقت التنفيذ هنا
export const revalidate = 0

export default function LoginPage() {
  const router = useRouter()
  const search = useSearchParams()
  // مسار الرجوع بعد الدخول (إن لم يوجد، للـ admin أو editor لاحقًا)
  const toParam = search?.get('to') ?? ''
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrMsg(null)
    const code = pass.trim()
    if (!code) {
      setErrMsg('أدخل كلمة المرور')
      return
    }
    setLoading(true)
    try {
      const role = await signInWithPasscode(code)
      // إن كان هناك ?to= فنرجع له، وإلا نختار الوجهة حسب الدور
      const dest = toParam || (role === 'admin' ? '/admin' : '/editor')
      router.replace(dest)
    } catch (err: any) {
      console.error('LOGIN_ERROR', err)
      setErrMsg(`فشل الدخول: ${err?.message || 'تحقق من الكلمة'}`)
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
        {errMsg && <p className="text-red-400 text-sm">{errMsg}</p>}
        <button className="btn w-full" disabled={loading}>
          {loading ? '...جارٍ الدخول' : 'دخول'}
        </button>
      </form>
      {toParam ? (
        <p className="text-white/60 text-sm mt-3">سيتم تحويلك بعد الدخول إلى: <code>{toParam}</code></p>
      ) : (
        <p className="text-white/60 text-sm mt-3">
          سيتم تحويل الأدمن إلى <code>/admin</code> والمحرّر إلى <code>/editor</code>
        </p>
      )}
    </main>
  )
}
