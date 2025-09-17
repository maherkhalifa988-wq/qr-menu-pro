'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [rid, setRid] = useState('al-nakheel')

  return (
    <main>
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2">QR Menu Pro (Cloudinary)</h1>
        <p className="text-white/70">حول قائمة مطعمك إلى تجربة رقمية رائعة</p>
      </header>

      <section className="card p-5 mb-6">
        <h2 className="font-bold mb-3">اختبر صفحة الزبون</h2>
        <div className="flex gap-2">
          <input
            className="input"
            value={rid}
            onChange={e => setRid(e.target.value)}
            placeholder="restaurant-id"
          />
          <Link className="btn whitespace-nowrap" href={/r/${rid}}>
            فتح القائمة
          </Link>
        </div>
        <p className="text-sm text-white/60 mt-2">
          اجعل رمز QR يشير إلى:{' '}
          <code className="bg-white/10 px-2 py-1 rounded">/r/&lt;restaurantId&gt;</code>
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-bold mb-2">لوحة الادارة</h3>
          <p className="text-white/70 mb-4">ادارة المطعم والشعار والخلفية والمجموعات والاصناف</p>
          <Link className="btn inline-block" href="/admin">
            دخول لوحة الادارة
          </Link>
        </div>

        <div className="card p-5">
          <h3 className="font-bold mb-2">محرر الاسعار</h3>
          <p className="text-white/70 mb-4">تعديل الاسعار فقط</p>
          <Link className="btn inline-block" href="/editor">
            اذهب للمحرر
          </Link>
        </div>
      </section>
    </main>
  )
}
