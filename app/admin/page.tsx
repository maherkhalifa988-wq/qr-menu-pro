'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getStoredRole, clearRole } from '@/lib/authClient'

export default function AdminPage() {
  const router = useRouter()
  const path = usePathname()

  useEffect(() => {
    const role = getStoredRole()
    if (role !== 'admin') {
      router.replace(`/login?to=${encodeURIComponent(path)}`)
    }
  }, [router, path])

  return (
    <main className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">لوحة الإدارة</h1>
        <button className="btn-ghost" onClick={() => { clearRole(); router.replace('/login?to=/admin') }}>
          تسجيل خروج
        </button>
      </div>
      <p className="text-white/70">أنت في صفحة الأدمن. ضع هنا أقسام الإدارة.</p>
    </main>
  )
}
