'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getStoredRole } from '@/lib/authClient'

// مكوّن الصفحة الرئيسي (عدّل الاسم إذا لزم)
export default function AdminPage() {
  const router = useRouter()
  const search = useSearchParams()

  // المسار المطلوب الرجوع إليه بعد تسجيل الدخول (إن لم يوجد، استخدم /admin)
  const path: string = search.get('to') ?? '/admin'

  useEffect(() => {
    const role = getStoredRole()
    if (role !== 'admin') {
      const safePath: string = path // نوع صريح
      router.replace(`/login?to=${encodeURIComponent(safePath)}`)
    }
  }, [router, path])

  // ... بقية محتوى صفحة الأدمن (UI الإدارة)
  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">لوحة الإدارة</h1>
      {/* محتوى الإدارة هنا */}
    </main>
  )
}
