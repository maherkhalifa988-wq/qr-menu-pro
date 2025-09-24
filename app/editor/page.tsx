'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredRole } from '@/lib/authClient'
import PriceEditor from './PriceEditor'

const RID = 'al-nakheel'

export default function EditorPage() {
  const router = useRouter()

  useEffect(() => {
    const role = getStoredRole()
    if (role !== 'editor' && role !== 'admin') {
      router.replace(`/login?to=${encodeURIComponent('/editor')}`)
    }
  }, [router])

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">محرر الأسعار</h1>
      <PriceEditor rid={RID} />
    </main>
  )
}
