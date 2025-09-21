'use client'

import { useEffect, useState } from 'react'
import AdminNav from '@/components/AdminNav'
import { signInWithPasscode } from '@/lib/authClient'

// إذا الكومبوننتين موجودين عندك داخل app/admin:
import AdminBrandSection from './AdminBrandSection'
import ImportFromJsonButton from './ImportFromJsonButton'

// لو عندك نسخة مدمجة اسمها AdminBrandAndImport بدل الاثنين فوق، استوردها وبدّل الاستخدام بالأسفل accordingly.

export default function AdminPage() {
  const [rid, setRid] = useState('al-nakheel')

  useEffect(() => {
    (async () => {
      const pass = window.prompt('ادخل كلمة سر الادمن') || ''
      const role = await signInWithPasscode(pass).catch(() => {
        alert('كلمة السر غير صحيحة')
        location.href = '/'
        return null
      })
      if (role !== 'admin') {
        alert('ليست لديك صلاحية الادمن')
        location.href = '/'
      }
    })()
  }, [])

  return (
    <main className="container mx-auto p-6">
      <AdminNav />

      {/* بطاقة تعريف سريعة + تغيير معرف المطعم */}
      <section className="card p-5 mb-4">
        <h1 className="text-2xl font-bold mb-2">لوحة الإدارة</h1>
        <p className="text-white/70 mb-4">إدارة المطعم والمجموعات والأصناف</p>

        <label className="label">معرّف المطعم (Restaurant ID)</label>
        <input
          className="input max-w-md"
          value={rid}
          onChange={(e) => setRid(e.target.value)}
          placeholder="al-nakheel"
        />
      </section>

      {/* القسم: الاسم/الشعار/الخلفية */}
      <AdminBrandSection rid={rid} />

      {/* زر استيراد القائمة من JSON */}
      <section className="my-6">
        <ImportFromJsonButton rid={rid} />
      </section>

      {/* هنا يمكنك إضافة أقسام أخرى (إدارة المجموعات/الأصناف يدويًا) */}
    </main>
  )
}
