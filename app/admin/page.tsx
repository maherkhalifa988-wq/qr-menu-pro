'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getStoredRole } from '@/lib/authClient'
import AdminBrandSection from './AdminBrandSection'
// إن كان عندك أجزاء إضافية في لوحة الإدارة استوردها هنا

// عطّل أي كاش/توليد ثابت لهذه الصفحة (آمن مع App Router)
export const revalidate = 0
export const dynamic = 'force-dynamic'

const RID = 'al-nakheel' // عدّلها لو عندك تعدد مطاعم

export default function AdminPage() {
  const router = useRouter()
  const search = useSearchParams()
  const toAfterLogin = '/admin'

  useEffect(() => {
    // القراءة من localStorage لازم تكون على العميل فقط (وهذا ملف client)
    const role = getStoredRole()
    if (role !== 'admin') {
      // أعِد توجيه للّوجين مع بارام to لكي يرجع للوحة بعد الدخول
      router.replace(`/login?to=${encodeURIComponent(toAfterLogin)`})
    }
  }, [router])

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">لوحة الإدارة</h1>

      {/* أقسام الإدارة */}
      <AdminBrandSection rid={RID} />
      {/* ضف بقية الأقسام مثل إدارة المجموعات/الأصناف إن وجدت */}
    </main>
  )
}
