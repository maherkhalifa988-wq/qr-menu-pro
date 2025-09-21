'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [rid, setRid] = useState('al-nakheel')

  return (
    <main className="container mx-auto p-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold mb-2">QR Menu Pro (Cloudinary)</h1>
        <p className="text-white/70">حوّل قائمة مطعمك إلى تجربة رقمية جميلة</p>
      </header>

      <section className="card p-5 mb-6">
        <h2 className="font-bold mb-3">اختبر صفحة الزبون</h2>
        <div className="flex gap-2">
          <input
            className="input"
            value={rid}
            onChange={(e) => setRid(e.target.value)}
            placeholder="restaurant-id"
          />
          {/* بدون backticks لتفادي مشاكل النسخ */}
          <Link className="btn whitespace-nowrap" href={'/r/' + rid}>
            فتح القائمة
          </Link>
        </div>
        <p className="text-sm text-white/60 mt-2">
          اجعل رمز QR يشير إلى: <code className="bg-white/10 px-2 py-1 rounded">/r/&lt;restaurantId&gt;</code>
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-bold mb-2">لوحة الإدارة</h3>
          <p className="text-white/70 mb-4">إدارة الشعار والخلفية والمجموعات والأصناف</p>
          <Link className="btn inline-block" href="/admin">
            دخول لوحة الإدارة
          </Link>
        </div>

        <div className="card p-5">
          <h3 className="font-bold mb-2">محرر الأسعار</h3>
          <p className="text-white/70 mb-4">تعديل الأسعار فقط</p>
          <Link className="btn inline-block" href="/editor">
            اذهب للمحرر
          </Link>
        </div>
      </section>
    </main>
  )
}    (lang === 'ar' ? (i.nameAr||i.name) : (i.nameEn||i.name)) || 'بدون اسم'

  useEffect(() => {
    async function load() {
      const qc = query(
        collection(db, 'restaurants', rid, 'categories'),
        orderBy('order', 'asc')
      )
      const qi = collection(db, 'restaurants', rid, 'items')
      const [cs, is] = await Promise.all([getDocs(qc), getDocs(qi)])
      setCats(cs.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
      setItems(is.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
    }
    if (rid) load()
  }, [rid])

  const filtered = selectedCat ? items.filter(i => i.catId === selectedCat) : []

  return (
    <main className="container mx-auto p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">القائمة</h1>
        <div className="flex gap-2">
          <button
            className={'btn-ghost ' + (lang === 'ar' ? 'ring-2' : '')}
            onClick={() => setLang('ar')}
          >
            عربي
          </button>
          <button
            className={'btn-ghost ' + (lang === 'en' ? 'ring-2' : '')}
            onClick={() => setLang('en')}
          >
            EN
          </button>
        </div>
      </header>

      {!selectedCat && (
        <>
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
        </>
      )}

      {selectedCat && (
        <>
          <div className="flex items-center justify-between mb-4">
            <button className="btn-ghost" onClick={() => setSelectedCat(null)}>
              ← رجوع للمجموعات
            </button>
            <div className="text-white/70">
              {labelCat(cats.find(c => c.id === selectedCat) || ({} as any))}
            </div>
          </div>

          <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map(it => (
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
        </>
      )}
    </main>
  )
}
