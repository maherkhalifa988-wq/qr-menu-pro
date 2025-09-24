'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getStoredRole } from '@/lib/authClient'
import AdminBrandSection from './AdminBrandSection'

export default function AdminPage() {
  const router = useRouter()
  const search = useSearchParams()

  // المسار المطلوب الرجوع إليه بعد تسجيل الدخول (إن لم يوجد، استخدم /admin)
  const path: string = search ? search.get('to') ?? '/admin' : '/admin'

  useEffect(() => {
    const role = getStoredRole()
    if (role !== 'admin') {
      router.replace(`/login?to=${encodeURIComponent(path)}`)
    }
  }, [router, path])

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">لوحة الإدارة</h1>
      <AdminBrandSection rid="al-nakheel" />
    </main>
  )
}
