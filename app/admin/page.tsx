'use client'

import { useEffect, useState } from 'react'
import AdminNav from '@/components/AdminNav'
import { signInWithPasscode } from '@/lib/authClient'

// هذه الأقسام يجب أن تكون موجودة كملفات في app/admin/
// لو بعضها غير موجود، احذف استيراده مؤقتًا
import AdminBrandSection from './AdminBrandSection'
import ImportFromJsonButton from './ImportFromJsonButton'
import AdminCategoriesManager from './AdminCategoriesManager'
import AdminItemsManager from './AdminItemsManager'

export default function AdminPage() {
  const [rid, setRid] = useState('al-nakheel')
  const [role, setRole] = useState<'admin' | 'editor' | null>(null)

  useEffect(() => {
    (async () => {
      const pass = window.prompt('ادخل كلمة سر الادمن/المحرر') || ''
      const r = await signInWithPasscode(pass).catch(() => null)
      if (!r) {
        alert('كلمة السر غير صحيحة')
        location.href = '/'
        return
      }
      setRole(r) // 'admin' أو 'editor'
      // لو مو admin نقدر نخلي بعض الأقسام مقفلة
    })()
  }, [])

  if (!role) {
    // لا نُظهر شيئًا حتى يكتمل التحقق
    return (
      <main className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">لوحة الإدارة</h1>
        <p className="text-white/70">جاري التحقق…</p>
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

      {/* اختيار/تغيير معرّف المطعم */}
      <section className="card p-5 mb-4">
        <label className="label">معرّف المطعم (Restaurant ID)</label>
        <input
          className="input max-w-md"
          value={rid}
          onChange={(e) => setRid(e.target.value)}
          placeholder="al-nakheel"
        />
      </section>

      {/* الهوية: الاسم/الشعار/الخلفية (مسموح للـ admin فقط إن أردت) */}
      <AdminBrandSection rid={rid} />

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
