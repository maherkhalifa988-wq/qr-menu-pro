'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getStoredRole } from '@/lib/authClient'
import AdminBrandSection from './AdminBrandSection'

const RID = 'al-nakheel' // أو اجلبها كما تحب لاحقًا

export default function AdminPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const path = sp?.get('to') ?? '/admin'

  useEffect(() => {
    const role = getStoredRole()
    if (role !== 'admin') {
      router.replace(`/login?to=${encodeURIComponent('/admin')}`)
    }
  }, [router])

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">لوحة الإدارة</h1>
      {/* أقسام الإدارة الحالية لديك */}
      <AdminBrandSection rid={RID} />
    </main>
  )
}
