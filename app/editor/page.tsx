'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getStoredRole } from '@/lib/authClient'
import PriceEditor from './PriceEditor' // إن كان عندك كومبوننت للمحرر

export default function EditorPage() {
  const router = useRouter()
  const search = useSearchParams()

  // مسار الرجوع بعد الدخول (افتراضي /editor)
  const path: string = search ? (search.get('to') ?? '/editor') : '/editor'

  useEffect(() => {
    const role = getStoredRole()
    // نسمح فقط للمحرر أو الإدمن بالدخول
    if (role !== 'editor' && role !== 'admin') {
      router.replace(`/login?to=${encodeURIComponent(path)}`)
    }
  }, [router, path])

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">محرر الأسعار</h1>
      <PriceEditor />
    </main>
  )
}
