'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore'

type Item = { id: string; name?: string; nameAr?: string; nameEn?: string; price?: number }

export default function PriceEditor({ rid }: { rid: string }) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const qi = query(collection(db, 'restaurants', rid, 'items'), orderBy('nameAr', 'asc'))
        const snap = await getDocs(qi)
        if (!mounted) return
        setItems(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [rid])

  async function savePrice(id: string, price: number) {
    setSavingId(id)
    try {
      await updateDoc(doc(db, 'restaurants', rid, 'items', id), { price })
      setItems((prev) => prev.map(i => i.id === id ? { ...i, price } : i))
    } finally {
      setSavingId(null)
    }
  }

  if (loading){
    return <p className="p-4">...جارٍ التحميل</p>
  }

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-lg">تعديل أسعار الأصناف</h2>
      <table className="w-full border border-white/20">
        <thead>
          <tr>
            <th className="p-2 text-left">الاسم</th>
            <th className="p-2">السعر</th>
          </tr>
        </thead>
        <tbody>
          {items.map(it => (
            <tr key={it.id}>
              <td className="p-2">{it.nameAr || it.nameEn || it.name}</td>
              <td className="p-2">
                <input
                  type="number"
                  defaultValue={it.price ?? 0}
                  className="input w-24"
                  onBlur={async (e) => {
                    const val = Number(e.target.value)
                    await updateDoc(doc(db, 'restaurants', rid, 'items', it.id), {
                      price: val,
                      updatedAt: Date.now(),
                    })
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
