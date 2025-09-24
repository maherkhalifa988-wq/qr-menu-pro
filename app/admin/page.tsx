'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredRole } from '@/lib/authClient'
import AdminBrandSection from './AdminBrandSection'

// عطّل أي كاش/توليد ثابت
export const revalidate = 0
export const dynamic = 'force-dynamic'

const RID = 'al-nakheel' // عدّلها إن لزم

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    const role = getStoredRole()
    if (role !== 'admin') {
      router.replace(`/login?to=${encodeURIComponent('/admin')}`)
    }
  }, [router])

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">لوحة الإدارة</h1>

      {/* أقسام الإدارة */}
      <AdminBrandSection rid={RID} />
      {/* أضف أقسامًا أخرى هنا إن وجدت */}
    </main>
  )
}
