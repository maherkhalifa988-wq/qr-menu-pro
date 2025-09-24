'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  query
} from 'firebase/firestore'

type Item = {
  id: string
  name?: string
  nameAr?: string
  nameEn?: string
  price?: number
  catId?: string
}

type Props = { rid: string }

export default function PriceEditor({ rid }: Props) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const qi = query(
          collection(db, 'restaurants', rid, 'items'),
          orderBy('nameAr')
        )
        const snap = await getDocs(qi)
        setItems(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
      } finally {
        setLoading(false)
      }
    }
    if (rid) load()
  }, [rid])

  async function savePrice(id: string, newPrice: number) {
    setSaving(id)
    try {
      const ref = doc(db, 'restaurants', rid, 'items', id)
      await updateDoc(ref, { price: newPrice })
      setItems(items.map(it => it.id === id ? { ...it, price: newPrice } : it))
      alert('✅ تم الحفظ')
    } catch (e: any) {
      console.error(e)
      alert('❌ خطأ: ' + (e?.message || e))
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return <p className="p-4">...جارٍ التحميل</p>
  }

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-lg">تعديل أسعار الأصناف</h2>
      <table className="w-full border border-white/20">
        <thead>
          <tr className="bg-white/10">
            <th className="p-2 text-left">الاسم (عربي)</th>
            <th className="p-2 text-left">الاسم (إنكليزي)</th>
            <th className="p-2 text-left">السعر</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {items.map(it => (
            <tr key={it.id} className="border-t border-white/10">
              <td className="p-2">{it.nameAr  it.name  'بدون اسم'}</td>
              <td className="p-2">{it.nameEn || '-'}</td>
              <td className="p-2">
                <input
                  type="number"
                  defaultValue={it.price ?? 0}
                  className="input w-28"
                  onBlur={e => {
                    const val = Number(e.target.value)
                    if (!isNaN(val) && val !== it.price) {
                      savePrice(it.id, val)
                    }
                  }}
                />
              </td>
              <td className="p-2">
                {saving === it.id && (
                  <span className="text-sm text-white/70">...جارٍ الحفظ</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
