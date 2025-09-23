'use client'
import { useEffect, useRef, useState } from 'react'
import { signInWithPasscode } from '@/lib/authClient'
import AdminNav from '@/components/AdminNav'
import AdminBrandSection from './AdminBrandSection'
import ImportFromJsonButton from './ImportFromJsonButton'
import AdminCategoriesManager from './AdminCategoriesManager'
import AdminItemsManager from './AdminItemsManager'

export default function AdminPage() {
  const [rid, setRid] = useState('al-nakheel')
  const [role, setRole] = useState<'admin' | 'editor' | null>(null)
  const [loading, setLoading] = useState(true)
  const ran = useRef(false) // يمنع التشغيل مرتين

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    ;(async () => {
      try {
        // استخدم الكاش في نفس الجلسة:
        const cached = sessionStorage.getItem('role')
        if (cached === 'admin' || cached === 'editor') {
          setRole(cached as 'admin' | 'editor')
          return
        }

        const pass = window.prompt('ادخل كلمة سر الادمن/المعدل') || ''
        const r = await signInWithPasscode(pass) // سترجع 'admin' أو 'editor'
        setRole(r)
        sessionStorage.setItem('role', r)
      } catch (err: any) {
        console.error('LOGIN_ERROR', err)
        alert('فشل الدخول: ${err?.message || err}')
        location.href = '/'
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return (
      <main className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">لوحة الإدارة</h1>
        <p className="text-white/70">…جاري التحقق</p>
      </main>
    )
  }

  // لو فشل الدخول سنكون قد حولنا للصفحة الرئيسية
  if (!role) return null

  return (
    <main className="container mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">لوحة الإدارة</h1>
        <p className="text-white/70">تم تسجيل الدخول كـ <b>{role}</b></p>
      </header>

      <AdminNav />

      <section className="card p-5 mb-4">
        <label className="label">معرّف المطعم (Restaurant ID)</label>
        <input
          className="input max-w-md"
          value={rid}
          onChange={(e) => setRid(e.target.value)}
          placeholder="al-nakheel"
        />
      </section>

      {/* الهوية */}
      <AdminBrandSection rid={rid} />

      {/* الاستيراد من JSON */}
      <section className="my-6">
        <ImportFromJsonButton rid={rid} />
      </section>

      {/* المجموعات */}
      <section className="my-6">
        <AdminCategoriesManager rid={rid} />
      </section>

      {/* الأصناف */}
      <section className="my-6">
        <AdminItemsManager rid={rid} />
      </section>
    </main>
  )
}
