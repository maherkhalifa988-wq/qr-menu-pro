'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getStoredRole } from '@/lib/authClient'

export default function EditorPage() {
  const router = useRouter()
  const search = useSearchParams()
  const path: string = search ? (search.get('to') ?? '/editor') : '/editor'

  useEffect(() => {
    const role = getStoredRole()
    if (role !== 'editor' && role !== 'admin') {
      router.replace(`/login?to=${encodeURIComponent(path)}`)
    }
  }, [router, path])

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">محرر الأسعار</h1>
      <div className="card p-5">
        <p className="text-white/70">محرر الأسعار — سيتم إكماله لاحقًا.</p>
      </div>
    </main>
  )
}
