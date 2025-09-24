'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getStoredRole, clearRole } from '@/lib/authClient'

export default function EditorPage() {
  const router = useRouter()
  const path = usePathname()

  useEffect(() => {
    const role = getStoredRole()
    if (role !== 'editor' && role !== 'admin') {
       const safepath= path ||
      router.replace(`/login?to=${encodeURIComponent(safepath)}`)
    }
  }, [router, path])

  return (
    <main className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">محرر الأسعار</h1>
        <button className="btn-ghost" onClick={() => { clearRole(); router.replace('/login?to=/editor') }}>
          تسجيل خروج
        </button>
      </div>
      <p className="text-white/70">هذه صفحة المحرّر. يظهر فيها ما يخص تعديل الأسعار فقط.</p>
    </main>
  )
}
