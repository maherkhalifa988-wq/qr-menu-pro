'use client'
import { useState, useEffect } from 'react'

export default function RestaurantPage({ params }: { params: { restaurantId: string } }) {
  const { restaurantId } = params
  const [restaurant, setRestaurant] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [lang, setLang] = useState<'ar' | 'en'>('ar')

  useEffect(() => {
    // هنا ممكن تجيب البيانات من Firestore أو أي مصدر
    // مؤقتاً خليتها بيانات تجريبية
    setRestaurant({ name: 'مطعم النخيل' })
    setItems([
      { id: 1, name: 'عصير تفاح', nameEn: 'Apple Juice', nameAr: 'عصير تفاح', price: 0 },
      { id: 2, name: 'بيتزا مارغريتا', nameEn: 'Pizza Margherita', nameAr: 'بيتزا مارغريتا', price: 0 },
    ])
  }, [restaurantId])

  const catLabel = (c: any) =>
    lang === 'ar' ? (c?.nameAr  c?.name) : (c?.nameEn  c?.name)

  const withLabels = items.map((i: any) => ({
    ...i,
    name: (lang === 'ar' ? i?.nameAr : i?.nameEn) || i?.name,
  }))

  return (
    <main>
      {restaurant && (
        <div className="mb-6 card overflow-hidden">
          <div className="relative h-40">
            <h1 className="text-2xl font-bold">{restaurant.name}</h1>
          </div>
        </div>
      )}

      <section>
        {withLabels.map((item) => (
          <div key={item.id} className="card p-4 mb-4">
            <p className="font-bold">{item.name}</p>
            <p className="text-sm text-white/70">{item.price} ل.س</p>
          </div>
        ))}
      </section>
    </main>
  )
}
