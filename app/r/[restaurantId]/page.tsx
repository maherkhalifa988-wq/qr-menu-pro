'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { db } from '@/lib/firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore'

type Cat = {
  id: string
  name?: string
  nameAr?: string
  nameEn?: string
  imageUrl?: string
  order?: number
}

type Item = {
  id: string
  catId: string
  name?: string
  nameAr?: string
  nameEn?: string
  price?: number
  imageUrl?: string
}

type Restaurant = {
  name?: string
  logoUrl?: string
  bgUrl?: string
}

export default function RestaurantPublicPage() {
  const params = useParams() as { restaurantId?: string } | null
  const rid = params?.restaurantId ?? ''

  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [selectedCat, setSelectedCat] = useState<string | null>(null)

  const [rest, setRest] = useState<Restaurant>({})
  const [cats, setCats] = useState<Cat[]>([])
  const [items, setItems] = useState<Item[]>([])

  const labelCat = (c: Cat) =>
    (lang === 'ar' ? (c.nameAr || c.name) : (c.nameEn || c.name)) || 'بدون اسم'

  const labelItem = (i: Item) =>
    (lang === 'ar' ? (i.nameAr || i.name) : (i.nameEn || i.name)) || 'بدون اسم'

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        if (!rid) return

        // 1) مطعم (الاسم/الشعار/الخلفية)
        const rRef = doc(db, 'restaurants', rid)
        const rSnap = await getDoc(rRef)
        const rData = (rSnap.exists() ? (rSnap.data() as any) : {}) as Restaurant

        // 2) المجموعات + الأصناف
        const catsQ = query(
          collection(db, 'restaurants', rid, 'categories'),
          orderBy('order', 'asc')
        )
        const itemsCol = collection(db, 'restaurants', rid, 'items')

        const [catsSnap, itemsSnap] = await Promise.all([getDocs(catsQ), getDocs(itemsCol)])

        if (!mounted) return

        setRest({
          name: rData?.name || '',
          logoUrl: rData?.logoUrl || '',
          bgUrl: rData?.bgUrl || '',
        })

        setCats(catsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))

        setItems(itemsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [rid])

  // أصناف المجموعة المحددة
  const filteredItems = useMemo(
    () => (selectedCat ? items.filter(i => i.catId === selectedCat) : []),
    [items, selectedCat]
  )

  return (
    <main className="container mx-auto p-6">
      {/* خلفية علويّة */}
      {rest.bgUrl ? (
        <div
          className="w-full h-56 rounded-2xl mb-6 border border-white/10"
          style={{
            backgroundImage: `url(${rest.bgUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          aria-label="background"
        />
      ) : null}

      {/* ترويسة */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {rest.logoUrl ? (
            <img
              src={rest.logoUrl}
              alt="Logo"
              width={80}
              height={80}
              className="rounded-xl border border-white/10 object-cover"
            />
          ) : null}
          <h1 className="text-2xl font-bold">
            {rest.name || 'القائمة'}
          </h1>
        </div>

        <div className="flex gap-2">
          <button
            className={'btn-ghost ' + (lang === 'ar' ? 'ring-2 ring-white/30' : '')}
            onClick={() => setLang('ar')}
          >
            عربي
          </button>
          <button
            className={'btn-ghost ' + (lang === 'en' ? 'ring-2 ring-white/30' : '')}
            onClick={() => setLang('en')}
          >
            EN
          </button>
        </div>
      </header>

      {/* تحميل */}
      {loading && (
        <div className="text-white/70">...جارٍ تحميل القائمة</div>
      )}

      {/* المجموعات */}
      {!loading && !selectedCat && (
        <section>
          <h2 className="font-bold mb-3">المجموعات</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {cats.map(c => (
              <button
                key={c.id}
                className="card overflow-hidden text-left"
                onClick={() => setSelectedCat(c.id)}
                title="افتح المجموعة"
              >
                <div className="relative h-36 w-full bg-white/5">
                  {c.imageUrl ? (
                    <img
                      src={c.imageUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/40">
                      لا توجد صورة
                    </div>
                  )}
                </div>
                <div className="p-4 font-semibold">{labelCat(c)}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* أصناف المجموعة */}
      {!loading && selectedCat && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <button
              className="btn-ghost"
              onClick={() => setSelectedCat(null)}
            >
              ← رجوع للمجموعات
            </button>
            <div className="text-white/70">
              {labelCat(cats.find(c => c.id === selectedCat) || ({} as any))}
            </div>
          </div>

          <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredItems.map(it => (
              <li key={it.id} className="card p-4">
                <div className="relative h-32 mb-3 bg-white/5 rounded">
                  {it.imageUrl ? (
                    <img
                      src={it.imageUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover rounded"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/40">
                      بدون صورة
                    </div>
                  )}
                </div>
                <div className="font-semibold">{labelItem(it)}</div>
                <div className="text-white/60">
                  {(it.price ?? 0).toString().padStart(3, '0')}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
