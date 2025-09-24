'use client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PriceEditor from './PriceEditor'


function getStoredRole(): 'admin' | 'editor' | '' {
  if (typeof window === 'undefined') return ''
  const r = localStorage.getItem('role') || ''
  return r === 'admin' || r === 'editor' ? r : ''
}

export default function EditorPage() {
  const router = useRouter()
  const params = useSearchParams()
  const to = params?.get('to') || '/editor'

  // ✅ معرّف المطعم (عدّله إن لزم)
  const rid = process.env.NEXT_PUBLIC_DEFAULT_RID ?? 'al-nakheel'

  useEffect(() => {
    const role = getStoredRole()
    if (role !== 'admin' && role !== 'editor') {
      router.replace(`/login?to=${encodeURIComponent(to)}`)
    }
  }, [router, to])

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">محرر الأسعار</h1>
      {/* ✅ مرّر الـ rid هنا */}
      <PriceEditor rid={rid} />
    </main>
  )
}
