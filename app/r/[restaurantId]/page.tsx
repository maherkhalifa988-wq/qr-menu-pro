'use client'
import { useEffect, useState } from 'react'

type Item = {
  id: string | number
  name?: string
  nameAr?: string
  nameEn?: string
  price?: number
  imageUrl?: string
  categoryId?: string
}

export default function RestaurantPage({
  params,
}: {
  params: { restaurantId: string }
}) {
  const { restaurantId } = params
  const [restaurant, setRestaurant] = useState<{ name: string } | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [lang, setLang] = useState<'ar' | 'en'>('ar')

  useEffect(() => {
    // مثال بيانات مؤقتة — فقط لضمان البناء ينجح
    setRestaurant({ name: 'مطعم النخيل' })
    setItems([
      { id: 1, nameAr: 'عصير تفاح', nameEn: 'Apple Juice', price: 0 },
      { id: 2, nameAr: 'بيتزا مارغريتا', nameEn: 'Margherita Pizza', price: 0 },
    ])
  }, [restaurantId])

  const catLabel = (c: any) =>
    lang === 'ar' ? (c?.nameAr  c?.name) : (c?.nameEn  c?.name)

  const withLabels = items.map((i) => ({
    ...i,
    name: (lang === 'ar' ? i?.nameAr : i?.nameEn) || i?.name,
  }))

  return (
    <main dir="rtl" className="container mx-auto p-4">
      {restaurant && (
        <div className="mb-6 card overflow-hidden p-4">
          <h1 className="text-2xl font-bold">{restaurant.name}</h1>
          <div className="mt-2 flex gap-2">
            <button
              className="btn-ghost"
              onClick={() => setLang('ar')}
              aria-pressed={lang === 'ar'}
            >
              عربي
            </button>
            <button
              className="btn-ghost"
              onClick={() => setLang('en')}
              aria-pressed={lang === 'en'}
            >
              EN
            </button>
          </div>
        </div>
      )}

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {withLabels.map((item) => (
          <div key={item.id} className="card p-4">
            <div className="flex items-center justify-between">
              <p className="font-bold">{item.name}</p>
              <span className="text-sm text-white/70">{item.price ?? 0} ل.س</span>
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}
