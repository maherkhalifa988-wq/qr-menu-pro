// app/editor/page.tsx
'use client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredRole } from '@/lib/role'
import PriceEditor from './PriceEditor' // تأكد أن الملف موجود

const RID = 'al-nakheel'

export default function EditorPage() {
  const router = useRouter()

  useEffect(() => {
    const role = getStoredRole()
    if (role !== 'editor' && role !== 'admin') {
      const to = '/editor'
      router.replace(`/login?to=${encodeURIComponent(to)}`)
    }
  }, [router])

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">محرر الأسعار</h1>
      <PriceEditor rid={RID} />
    </main>
  )
}
