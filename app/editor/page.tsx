'use client'
import { useEffect, useState } from 'react'
import AdminNav from '@/components/AdminNav'
import { db } from '@/lib/firebase'
import { doc, collection, getDocs, updateDoc } from 'firebase/firestore'
import { signInWithPasscode } from '@/lib/authClient'

type Item = { id: string; name?: string; nameAr?: string; nameEn?: string; price: number }

export default function PriceEditor() {
  const [rid, setRid] = useState('al-nakheel')
  const [items, setItems] = useState<Item[]>([])

  // تحقق من كلمة مرور المحرر (أو الأدمن) قبل الدخول
  useEffect(() => {
    (async () => {
      const pass = window.prompt('ادخل كلمة سر محرر الاسعار') || "
      const role = await signInWithPasscode(pass).catch(() => {
        alert('كلمة السر غير صحيحة')
        location.href = '/'
      })
      if (!(role === 'editor' || role === 'admin')) {
        alert('ليست لديك صلاحية المحرر')
        location.href = '/'
      }
    })()
  }, [])

  const loadItems = async () => {
    const iref = collection(doc(db, 'restaurants', rid), 'items')
    const snap = await getDocs(iref)
    setItems(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
  }

  const updatePrice = async (id: string, price: number) => {
    await updateDoc(doc(db, 'restaurants', rid, 'items', id), { price })
    await loadItems()
  }

  return (
    <main>
      <AdminNav />
      <section className="card p-5 mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="grow">
            <label className="block text-sm text-white/60 mb-1">معرف المطعم</label>
            <input className="input" value={rid} onChange={e => setRid(e.target.value)} />
          </div>
          <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20" onClick={loadItems}>
            تحميل الاصناف
          </button>
        </div>
      </section>

      <section className="card p-5">
        <h3 className="font-bold mb-3">تعديل الاسعار</h3>
        <ul className="space-y-2">
          {items.map(it => (
            <li key={it.id} className="flex items-center gap-3 bg-white/10 rounded-xl p-2">
              <span className="w-64 truncate">{it.nameAr||it.name||it.nameEn}</span>
              <input
                className="input max-w-32 text-right"
                type="number"
                defaultValue={it.price}
                onBlur={e => updatePrice(it.id, Number(e.target.value))}
              />
              <span className="text-white/60 text-sm">({it.id})</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
