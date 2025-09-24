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
          <tr className="bg-white/5">
            <th className="p-2 text-right">الاسم</th>
            <th className="p-2 text-right">السعر</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="border-t border-white/10">
              <td className="p-2">{it.nameAr  it.name  it.nameEn || '—'}</td>
              <td className="p-2">
                <input
                  className="input w-32"
                  type="number"
                  defaultValue={it.price ?? 0}
                  onChange={(e) => {
                    const v = Number(e.target.value || 0)
                    setItems(prev => prev.map(x => x.id === it.id ? { ...x, price: v } : x))
                  }}
                />
              </td>
              <td className="p-2">
                <button
                  className="btn"
                  disabled={savingId === it.id}
                  onClick={() => savePrice(it.id, Number(items.find(x => x.id === it.id)?.price ?? 0))}
                >
                  {savingId === it.id ? '...يحفظ' : 'حفظ'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
