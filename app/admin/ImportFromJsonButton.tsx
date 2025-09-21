'use client'
import { useState } from 'react'
import { db } from '@/lib/firebase'
import { doc, setDoc, collection, addDoc } from 'firebase/firestore'

export default function ImportFromJsonButton() {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/data/seed_alnakheel.json')
      const data = await res.json()

      // 1) مطعم
      await setDoc(doc(db, 'restaurants', data.id), {
        nameAr: data.nameAr,
        name: data.nameAr,
        createdAt: Date.now(),
      }, { merge: true })

      // 2) categories + items
      for (const cat of data.categories) {
        await setDoc(doc(db, 'restaurants', data.id, 'categories', cat.id), {
          id: cat.id,
          nameAr: cat.nameAr,
          nameEn: cat.nameEn || '',
          createdAt: Date.now(),
        }, { merge: true })

        for (const it of (cat.items || [])) {
          await addDoc(collection(db, 'restaurants', data.id, 'items'), {
            nameAr: it.nameAr,
            nameEn: it.nameEn || '',
            name: it.nameAr,
            price: it.price ?? 0,
            categoryId: cat.id,
            createdAt: Date.now(),
          })
        }
      }

      setDone(true)
    } catch (e: any) {
      setError(e?.message || 'failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-4">
      <h3 className="font-bold mb-2">استيراد المنيو من JSON</h3>
      <p className="text-white/70 mb-3">سيُضاف/يُحدّث المنيو للمطعم الموجود في JSON.</p>
      <button className="btn" onClick={run} disabled={loading}>
        {loading ? 'جاري الاستيراد...' : 'استيراد الآن'}
      </button>
      {done && <p className="text-green-400 mt-2">تم الاستيراد ✅</p>}
      {error && <p className="text-red-400 mt-2">خطأ: {error}</p>}
    </div>
  )
}
