// app/admin/page.tsx
'use client'

import { useEffect, useState } from 'react'
import AdminNav from '@/components/AdminNav'
import { signInWithPasscode } from '@/lib/authClient'

// أقسام الإدارة
import AdminBrandSection from './AdminBrandSection'
import ImportFromJsonButton from './ImportFromJsonButton'
import AdminCategoriesManager from './AdminCategoriesManager'
import AdminItemsManager from './AdminItemsManager'

export default function AdminPage() {
  const [rid, setRid] = useState('al-nakheel') // المعرّف الافتراضي للمطعم
  const [role, setRole] = useState<'admin' | 'editor' | null>(null)
  const [loading, setLoading] = useState(true)

useEffect(() => {
  (async () => {
    const pass = window.prompt('ادخل كلمة سر الادمن/المحرر') || ''
    try {
      const r = await signInWithPasscode(pass) // 'admin' | 'editor'
      setRole(r)
    } catch (err: any) {
      alert('فشل الدخول: ${err?.message || err}')
      location.href = '/'
    }
  })()
}, [])

  if (loading) {
    return (
      <main className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">لوحة الإدارة</h1>
        <p className="text-white/70">...جاري التحقق</p>
      </main>
    )
  }

  if (!role) {
    return (
      <main className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">لوحة الإدارة</h1>
        <p className="text-red-400">فشل تسجيل الدخول</p>
      </main>
    )
  }

  return (
    <main className="container mx-auto p-6">
      <AdminNav />
      <header className="mb-6">
        <h1 className="text-2xl font-bold">لوحة الإدارة</h1>
        <p className="text-white/70">تم تسجيل الدخول كـ <b>{role}</b></p>
      </header>

      {/* اختيار/تغيير معرف المطعم */}
      <section className="card p-5 mb-4">
        <label className="label">معرف المطعم (Restaurant ID)</label>
        <input
          className="input max-w-md"
          value={rid}
          onChange={(e) => setRid(e.target.value)}
          placeholder="al-nakheel"
        />
      </section>

      {/* الهوية: الاسم/الشعار/الخلفية (مسموح للـ admin فقط) */}
      {role === 'admin' && <AdminBrandSection rid={rid} />}

      {/* استيراد JSON للمجموعات والأصناف */}
      <section className="my-6">
        <ImportFromJsonButton rid={rid} />
      </section>

      {/* إدارة المجموعات */}
      <section className="my-6">
        <AdminCategoriesManager rid={rid} />
      </section>

      {/* إدارة الأصناف وتعديل الأسعار */}
      <section className="my-6">
        <AdminItemsManager rid={rid} />
      </section>
    </main>
  )
}
