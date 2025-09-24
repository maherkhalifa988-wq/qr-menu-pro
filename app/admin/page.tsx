// app/admin/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getStoredRole, clearStoredRole } from '@/lib/role'
import AdminBrandSection from './AdminBrandSection'
// … (أي أقسام أخرى عندك)

export default function AdminPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const to = sp?.get('to') ?? '/admin'

  useEffect(() => {
    const role = getStoredRole()
    if (role !== 'admin') {
      router.replace(`/login?to=${encodeURIComponent(to)}`)
    }
  }, [router, to])

  function logout() {
    clearStoredRole()
    router.replace(`/login?to=${encodeURIComponent('/admin')}`)
  }

  // عدّل الـ rid كما تستخدمه عندك (مثلاً ثابت أو من إعدادات)
  const rid = 'al-nakheel'

  return (
    <main className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">لوحة الإدارة</h1>
        <button className="btn-ghost" onClick={logout}>تسجيل الخروج</button>
      </div>

      <AdminBrandSection rid={rid} />
      {/* ضع بقية أقسام الإدارة هنا */}
    </main>
  )
}
