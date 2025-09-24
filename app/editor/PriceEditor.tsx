'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'

export default function PriceEditor({ rid }: { rid: string }) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const col = collection(db, 'restaurants', rid, 'items')
      const snap = await getDocs(col)
      setItems(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
      setLoading(false)
    }
    load()
  }, [rid])

  if (loading) {
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
