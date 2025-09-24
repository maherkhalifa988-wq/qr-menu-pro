'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getStoredRole } from '@/lib/authClient'
import AdminBrandSection from './AdminBrandSection'
// إن كان لديك أقسام أخرى استوردها هنا بنفس الشكل

// أوقف أي إعادة توليد ثابتة
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function AdminPage() {
  const router = useRouter()
  const search = useSearchParams()
  const path: string = search?.get('to') ?? '/admin'

  useEffect(() => {
    // ممنوع استخدام localStorage خارج useEffect
    const role = getStoredRole() // تقرأ من localStorage
    if (role !== 'admin') {
      // لو المستخدم ليس admin، أعد توجيهه لصفحة الدخول مع بارامتر العودة
      router.replace(`/login?to=${encodeURIComponent(path)}`)
    }
  }, [router, path])

  // المحتوى سيظهر فقط بعد تحقق useEffect، ولو ليس admin سيتم التحويل
  // تأكد أن كل الأقسام المستخدمة هنا هي أيضاً 'use client'
  const rid = 'al-nakheel' // أو أي آلية لديك لتحديد المطعم

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">لوحة الإدارة</h1>
      <AdminBrandSection rid={rid} />
      {/* ضع باقي الأقسام هنا */}
    </main>
  )
}
