'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredRole } from '@/lib/authClient'
import AdminBrandSection from './AdminBrandSection'

const RID = 'al-nakheel' // غيّرها لو عندك معرّف مطعم مختلف

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    const role = getStoredRole?.() // لو الدالة غير موجودة ما ينهار
    if (role !== 'admin') {
      router.replace(`/login?to=${encodeURIComponent('/admin')}`)
    }
  }, [router])

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">لوحة الإدارة</h1>
      <AdminBrandSection rid={RID} />
    </main>
  )
}
