'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PriceEditor from './PriceEditor'

export const revalidate = 0; // أو false — المهم ليست Object

// fallback بسيط لو ما عندك دالة getStoredRole جاهزة
function getStoredRole(): 'admin' | 'editor' | '' {
  if (typeof window === 'undefined') return ''
  const r = localStorage.getItem('role') || ''
  return r === 'admin' || r === 'editor' ? r : ''
}

export default function EditorPage() {
  const router = useRouter()
  const params = useSearchParams()
  const to = params?.get('to') || '/editor'
  const rid='al-nakheel'

  useEffect(() => {
    const role = getStoredRole()
    // اسمح للـ admin والـ editor بالدخول. غيّرها إذا تبيها للـ editor فقط.
    if (role !== 'admin' && role !== 'editor') {
      router.replace(`/login?to=${encodeURIComponent(to)}`)
    }
  }, [router, to])

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">محرر الأسعار</h1>
      <PriceEditor />
    </main>
  )
}
