// app/editor/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getStoredRole, clearStoredRole } from '@/lib/role'

// لو عندك PriceEditor حقيقي، استورده هنا.
// مؤقتًا نعرض Placeholder حتى لا يكسر البناء لو الملف غير موجود.
// import PriceEditor from './PriceEditor'

function PriceEditorPlaceholder() {
  return (
    <div className="card p-5">
      <h2 className="font-bold mb-2">محرر الأسعار</h2>
      <p className="text-white/70">ضع هنا مكوّن محرر الأسعار (PriceEditor).</p>
    </div>
  )
}

export default function EditorPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const to = sp?.get('to') ?? '/editor'

  useEffect(() => {
    const role = getStoredRole()
    if (role !== 'admin' && role !== 'editor') {
      router.replace(`/login?to=${encodeURIComponent(to)}`)
    }
  }, [router, to])

  function logout() {
    clearStoredRole()
    router.replace(`/login?to=${encodeURIComponent('/editor')}`)
  }

  return (
    <main className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">محرر الأسعار</h1>
        <button className="btn-ghost" onClick={logout}>تسجيل الخروج</button>
      </div>

      {/* استبدل الـ Placeholder بالمكوّن الحقيقي لو كان موجود */}
      <PriceEditorPlaceholder />
    </main>
  )
}
