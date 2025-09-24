// app/admin/page.tsx
'use client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getStoredRole } from '@/lib/role'
import AdminBrandSection from './AdminBrandSection'
// استورد بقية أقسام الإدارة عندك…

const RID = 'al-nakheel' // أو حسب طريقتك لقراءة الـ restaurantId

export default function AdminPage() {
  const router = useRouter()
  const search = useSearchParams()

  useEffect(() => {
    const role = getStoredRole()
    if (role !== 'admin') {
      const to = '/admin'
      router.replace(`/login?to=${encodeURIComponent(to)}`)
    }
  }, [router, search])

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">لوحة الإدارة</h1>
      <AdminBrandSection rid={RID} />
      {/* ضع بقية الأقسام… */}
    </main>
  )
}
