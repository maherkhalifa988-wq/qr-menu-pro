'use client'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import MenuGrid from '@/components/MenuGrid'
import { db } from '@/lib/firebase'
import { doc, getDoc, collection, getDocs, query, orderBy, where } from 'firebase/firestore'
import { Category, Item, Restaurant } from '@/lib/types'

type Lang = 'ar' | 'en';

export default function MenuView() {
  const { restaurantId } = useParams<{ restaurantId: string }>()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [active, setActive] = useState<string>('all')
  const [lang, setLang] = useState<Lang>('ar')

  useEffect(() => {
    const load = async () => {
      const rref = doc(db, 'restaurants', restaurantId)
      const r = await getDoc(rref)
      if (r.exists()) setRestaurant({ id: r.id, ...r.data() } as Restaurant)

      const cref = collection(db, 'restaurants', restaurantId, 'categories')
      const cqs = await getDocs(query(cref, orderBy('order', 'asc')))
      const cats = cqs.docs.map(d => ({ id: d.id, ...d.data() } as Category))
      setCategories([{ id: 'all', name: 'الكل', order: 0 }, ...cats])

      const iref = collection(db, 'restaurants', restaurantId, 'items')
      const iqs = await getDocs(query(iref, where('available', 'in', [true, null])))
      setItems(iqs.docs.map(d => ({ id: d.id, ...d.data() } as Item)))
    }
    load()
  }, [restaurantId])

  const filtered = useMemo(
    () => (active === 'all' ? items : items.filter(i => i.categoryId === active)),
    [active, items]
  )

  const catLabel = (c: any) =>
  lang === 'ar' ? (c.nameAr||c.name) : (c.nameEn||c.name);
  const withLabels = filtered.map(i => ({
    ...i,
    name: (lang === 'ar' ? (i as any).nameAr : (i as any).nameEn) || i.name
  }));

  return (
    <main>
      {restaurant && (
        <div className="mb-6 card overflow-hidden">
          <div className="relative h-40">
            {restaurant.backgroundUrl ? (
              <Image src={restaurant.backgroundUrl} alt="bg" fill className="object-cover opacity-70" />
            ) : (
              <div className="w-full h-full bg-white/10" />
            )}
          </div>
          <div className="p-4 flex items-center gap-3">
            {restaurant.logoUrl && (
              <Image src={restaurant.logoUrl} alt="logo" width={56} height={56} className="rounded-xl" />
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold">{restaurant.name}</h1>
              <p className="text-white/60 text-sm">مرحبا بكم! امسحوا QR للوصول للقائمة</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setLang('ar')}
                className={px-3 py-2 rounded-xl ${lang === 'ar' ? 'bg-white/20' : 'bg-white/10'}}
              >
                AR
              </button>
              <button
                onClick={() => setLang('en')}
                className={px-3 py-2 rounded-xl ${lang === 'en' ? 'bg-white/20' : 'bg-white/10'}}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={px-3 py-2 rounded-xl whitespace-nowrap ${
              active === c.id ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'
            }}
          >
            {catLabel(c)}
          </button>
        ))}
      </div>

      <MenuGrid items={withLabels as any} />
    </main>
  )
}
