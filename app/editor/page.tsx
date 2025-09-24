'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getStoredRole } from '@/lib/authClient'

export default function EditorPage() {
  const router = useRouter()
  const search = useSearchParams()

  const path: string = search.get('to') ?? '/editor'

  useEffect(() => {
    const role = getStoredRole()
    if (role !== 'editor' && role !== 'admin') {
      const safePath: string = path
      router.replace(`/login?to=${encodeURIComponent(safePath)}`)
    }
  }, [router, path])

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">محرر الأسعار</h1>
      {/* محتوى المحرر هنا */}
    </main>
  )
}
