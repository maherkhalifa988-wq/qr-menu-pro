'use client'
import { useEffect, useState } from 'react'
import { signInWithPasscode } from '@/lib/authClient'

export default function AdminPage() {
  const [status, setStatus] = useState<'idle'|'checking'|'ok'|'denied'>('idle')
  const [role, setRole] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    (async () => {
      setStatus('checking')
      const input = window.prompt('ادخل كلمة سر الادمن') || ''
      const pass = input.trim()
      if (!pass) { setError('لم تُدخل كلمة سر'); setStatus('denied'); return }

      try {
        const r = await signInWithPasscode(pass)
        setRole(r)
        if (r !== 'admin') {
          setError('ليس لديك صلاحية الأدمن')
          setStatus('denied')
        } else {
          setStatus('ok')
        }
      } catch (e:any) {
        console.error('[admin/page] sign-in error:', e?.message || e)
        setError('كلمة السر غير صحيحة')
        setStatus('denied')
      }
    })()
  }, [])

  if (status === 'checking') {
    return <main className="container mx-auto p-6"><p>جار التحقق…</p></main>
  }

  if (status === 'denied') {
    return (
      <main className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">تم رفض الدخول</h1>
        <p className="text-red-400">{error}</p>
        <p className="text-white/60 mt-2">جرّب إعادة تحميل الصفحة والمحاولة مرة أخرى.</p>
      </main>
    )
  }

  // status === 'ok'
  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">لوحة الإدارة</h1>
      <p className="text-white/60 mb-4">تم تسجيل الدخول كـ: <b>{role}</b></p>

      {/* ضع بقية أقسام لوحة الإدارة هنا */}
    </main>
  )
}
