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

type Restaurant = {
  name?: string
  logoUrl?: string
  bgUrl?: string
}

type Cat = {
  id: string
  name?: string
  nameAr?: string
  nameEn?: string
  imageUrl?: string   // صورة المجموعة
  order?: number
}

type Item = {
  id: string
  catId: string
  name?: string
  nameAr?: string
  nameEn?: string
  price?: number
  // مافي صور للأصناف
}

export default function RestaurantPublicPage() {
  const params = useParams() as { restaurantId?: string } | null
  const rid = params?.restaurantId ?? ''

  const [restaurant, setRestaurant] = useState<Restaurant>({})
  const [cats, setCats] = useState<Cat[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [loading, setLoading] = useState(true)

  const labelCat = (c: Cat) =>
    (lang === 'ar' ? (c.nameAr || c.name) : (c.nameEn || c.name)) || 'بدون اسم'

  const labelItem = (i: Item) =>
    (lang === 'ar' ? (i.nameAr || i.name) : (i.nameEn || i.name)) || 'بدون اسم'

  // تحميل بيانات المطعم + المجموعات + الأصناف
  useEffect(() => {
    let mounted = true
    async function loadAll() {
      if (!rid) return
      setLoading(true)
      try {
        // مطعم
        const rSnap = await getDoc(doc(db, 'restaurants', rid))
        if (!mounted) return
        setRestaurant((rSnap.exists() ? (rSnap.data() as any) : {}) || {})
        // مجموعات
        const qc = query(collection(db, 'restaurants', rid, 'categories'), orderBy('order', 'asc'))
        const cs = await getDocs(qc)
        if (!mounted) return
        setCats(cs.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
        // أصناف
        const qi = collection(db, 'restaurants', rid, 'items')
        const is = await getDocs(qi)
        if (!mounted) return
        setItems(is.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadAll()
    return () => { mounted = false }
  }, [rid])

  const filteredItems = useMemo(
    () => (selectedCat ? items.filter(i => i.catId === selectedCat) : []),
    [items, selectedCat]
  )

  const bgStyle: React.CSSProperties | undefined = restaurant?.bgUrl
    ? {
        backgroundImage: `url(${restaurant.bgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <div
        className="w-full"
        style={{ ...bgStyle }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4" style={{ padding: '18px 0' }}>
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

            <div className="flex items-center gap-3 ml-auto">
              <div className="text-xl sm:text-2xl font-bold whitespace-nowrap">
                {restaurant?.name || 'مطعم'}
              </div>
              {restaurant?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={restaurant.logoUrl}
                  alt="Logo"
                  width={56}
                  height={56}
                  style={{ borderRadius: 12 }}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        {loading ? (
          <div className="text-white/70">...جارٍ التحميل</div>
        ) : !selectedCat ? (
          <>
            <h2 className="font-bold mb-3">المجموعات</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {cats.map((c) => (
                <button
                  key={c.id}
                  className="card overflow-hidden text-left"
                  onClick={() => setSelectedCat(c.id)}
                  title="افتح المجموعة"
                >
                  <div className="relative h-36 w-full bg-white/5">
                    {c.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
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
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <button className="btn-ghost" onClick={() => setSelectedCat(null)}>
                ← رجوع للمجموعات
              </button>
              <div className="text-white/70">
                {labelCat(cats.find((c) => c.id === selectedCat) || ({} as any))}
              </div>
            </div>

            <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredItems.map((it) => (
                <li key={it.id} className="card p-4">
                  <div className="font-semibold">{labelItem(it)}</div>
                  <div className="text-white/60">
                    {(it.price ?? 0).toString().padStart(3, '0')}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  )
}
