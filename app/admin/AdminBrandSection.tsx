'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { db } from '@/lib/firebase'
import {
  doc, getDoc, setDoc, updateDoc,
  collection, getDocs, addDoc, deleteDoc
} from 'firebase/firestore'
import { uploadImage } from '@/lib/uploadImage'

type FlatCategory = { id?: string; name?: string; nameAr?: string; nameEn?: string; order?: number; imageUrl?: string }
type FlatItem = { id?: string; catId: string; name?: string; nameAr?: string; nameEn?: string; price?: number; imageUrl?: string; order?: number }

type NestedCategory = {
  id?: string
  name?: string
  nameAr?: string
  nameEn?: string
  order?: number
  imageUrl?: string
  items?: Array<{ id?: string; name?: string; nameAr?: string; nameEn?: string; price?: number; imageUrl?: string; order?: number }>
}

type SeedRestaurant =
  | {
      // صيغة مسطّحة
      name?: string
      logoUrl?: string
      bgUrl?: string
      categories?: FlatCategory[]
      items?: FlatItem[]
    }
  | {
      // صيغة متداخلة
      restaurantId?: string
      defaultPrice?: number
      name?: string
      logoUrl?: string
      bgUrl?: string
      categories: NestedCategory[]
    }

export default function AdminBrandAndImport({ rid = 'al-nakheel' }: { rid?: string }) {
  const [restaurantId, setRestaurantId] = useState(rid)
  const [name, setName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [bgUrl, setBgUrl] = useState('')
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [saving, setSaving] = useState(false)

  const [importBusy, setImportBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  // تحميل بيانات الهوية
  useEffect(() => {
    (async () => {
      setLoadingInfo(true)
      try {
        const snap = await getDoc(doc(db, 'restaurants', restaurantId))
        const data = snap.data() as any
        if (data) {
          setName(data.name || '')
          setLogoUrl(data.logoUrl || '')
          setBgUrl(data.bgUrl || '')
        } else {
          // أنشئ وثيقة المطعم إن لم تكن موجودة
          await setDoc(doc(db, 'restaurants', restaurantId), { name: 'مطعم النخيل', createdAt: Date.now() }, { merge: true })
          setName('مطعم النخيل')
        }
      } finally {
        setLoadingInfo(false)
      }
    })()
  }, [restaurantId])

  // حفظ الاسم
  async function saveName() {
    setSaving(true)
    try {
      await updateDoc(doc(db, 'restaurants', restaurantId), { name, updatedAt: Date.now() })
      alert('تم حفظ الاسم ✅')
    } finally {
      setSaving(false)
    }
  }

  // رفع الشعار/الخلفية
  async function onUploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setSaving(true)
    try {
      const url = await uploadImage(f, restaurants/${restaurantId}/brand)
      setLogoUrl(url)
      await updateDoc(doc(db, 'restaurants', restaurantId), { logoUrl: url, updatedAt: Date.now() })
      alert('تم رفع الشعار ✅')
    } catch (err: any) {
      alert('فشل رفع الشعار: ' + (err?.message || ''))
    } finally {
      setSaving(false)
    }
  }
  async function onUploadBg(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setSaving(true)
    try {
      const url = await uploadImage(f, restaurants/${restaurantId}/brand)
      setBgUrl(url)
      await updateDoc(doc(db, 'restaurants', restaurantId), { bgUrl: url, updatedAt: Date.now() })
      alert('تم رفع الخلفية ✅')
    } catch (err: any) {
      alert('فشل رفع الخلفية: ' + (err?.message || ''))
    } finally {
      setSaving(false)
    }
  }

  // استيراد JSON
  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setImportBusy(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text) as SeedRestaurant

      // 0) معرّف المطعم من الملف (إن وجد)
      const ridFromFile = (data as any)?.restaurantId
      const rid = ridFromFile || restaurantId
      setRestaurantId(rid)
      // 1) الهوية (اختياري)
      const nameIn = (data as any).name ?? name ?? 'مطعم النخيل'
      const logoIn = (data as any).logoUrl ?? logoUrl ?? ''
      const bgIn   = (data as any).bgUrl   ?? bgUrl   ?? ''
      await setDoc(doc(db, 'restaurants', rid), {
        name: nameIn, logoUrl: logoIn, bgUrl: bgIn, updatedAt: Date.now()
      }, { merge: true })

      // 2) تفريغ القديم (اختياري لكنه أنظف)
      const catsCol = collection(db, 'restaurants', rid, 'categories')
      const itemsCol = collection(db, 'restaurants', rid, 'items')
      const [oldCats, oldItems] = await Promise.all([getDocs(catsCol), getDocs(itemsCol)])
      await Promise.all(oldItems.docs.map(d => deleteDoc(d.ref)))
      await Promise.all(oldCats.docs.map(d => deleteDoc(d.ref)))

      // 3) هل الصيغة متداخلة أم مسطّحة؟
      const looksNested =
        Array.isArray((data as any)?.categories) &&
        ((data as any)?.categories?.[0]?.items || (data as any)?.categories?.some((c: any) => Array.isArray(c?.items)))

      const catIdMap = new Map<string, string>() // map من id الأصلي -> id الجديد في فايرستور

      if (looksNested) {
        // —— متداخلة —— { categories: [ { name..., imageUrl, items:[...] } ] }
        const nestedCats = (data as any).categories as NestedCategory[]
        for (const c of nestedCats) {
          const newCatRef = await addDoc(catsCol, {
            name: c.name ?? c.nameAr ?? c.nameEn ?? '',
            nameAr: c.nameAr ?? '',
            nameEn: c.nameEn ?? '',
            order: c.order ?? 0,
            imageUrl: c.imageUrl ?? '',         // مهم: نحتفظ بصورة المجموعة
            createdAt: Date.now(),
          })
          if (c.id) catIdMap.set(c.id, newCatRef.id)

          for (const it of c.items ?? []) {
            await addDoc(itemsCol, {
              catId: newCatRef.id,
              name: it.name ?? it.nameAr ?? it.nameEn ?? '',
              nameAr: it.nameAr ?? '',
              nameEn: it.nameEn ?? '',
              price: Number((it as any).price ?? (data as any).defaultPrice ?? 0),
              imageUrl: it.imageUrl ?? '',
              order: it.order ?? 0,
              createdAt: Date.now(),
            })
          }
        }
      } else {
        // —— مسطّحة —— { categories:[...], items:[...] }
        const flatCats = ((data as any).categories || []) as FlatCategory[]
        const flatItems = ((data as any).items || []) as FlatItem[]

        for (const c of flatCats) {
          const newCatRef = await addDoc(catsCol, {
            name: c.name ?? c.nameAr ?? c.nameEn ?? '',
            nameAr: c.nameAr ?? '',
            nameEn: c.nameEn ?? '',
            order: c.order ?? 0,
            imageUrl: c.imageUrl ?? '',       // مهم: نحتفظ بصورة المجموعة
            createdAt: Date.now(),
          })
          if (c.id) catIdMap.set(c.id, newCatRef.id)
        }

        for (const it of flatItems) {
          const newCatId = catIdMap.get(it.catId) ?? it.catId
          await addDoc(itemsCol, {
            catId: newCatId,
            name: it.name ?? it.nameAr ?? it.nameEn ?? '',
            nameAr: it.nameAr ?? '',
            nameEn: it.nameEn ?? '',
            price: Number(it.price ?? 0),
            imageUrl: it.imageUrl ?? '',
            order: it.order ?? 0,
            createdAt: Date.now(),
          })
        }
      }

      alert('تم استيراد القائمة بنجاح ✅')
      e.target.value = ''
    } catch (err: any) {
      console.error(err)
      alert('فشل الاستيراد: ' + (err?.message || ''))
    } finally {
      setImportBusy(false)
    }
  }

  return (
    <>
      {/* بطاقة اختيار/تغيير المعرّف */}
      <section className="card p-5 mb-4">
        <label className="label">معرّف المطعم (Restaurant ID)</label>
        <input
          className="input max-w-md"
          value={restaurantId}
          onChange={(e) => setRestaurantId(e.target.value)}
          placeholder="al-nakheel"
        />
      </section>
      {/* الهوية: الاسم / الشعار / الخلفية */}
      <section className="card p-5 mb-6">
        <h2 className="font-bold mb-4">الهوية (الاسم، الشعار، الخلفية)</h2>

        {/* اسم المطعم */}
        <label className="label">اسم المطعم</label>
        <div className="flex gap-2 mb-4">
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loadingInfo}
            placeholder="اسم المطعم"
          />
          <button className="btn" onClick={saveName} disabled={saving || loadingInfo}>
            {saving ? 'جارٍ الحفظ…' : 'حفظ الاسم'}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* الشعار */}
          <div>
            <label className="label">الشعار</label>
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" onChange={onUploadLogo} disabled={saving || loadingInfo} />
              {(saving || loadingInfo) && <span className="text-white/70 text-sm">...جاري المعالجة</span>}
            </div>
            {logoUrl ? (
              <div className="mt-3">
                <Image
                  src={logoUrl}
                  alt="Logo"
                  width={160}
                  height={160}
                  className="rounded-xl border border-white/10 object-contain bg-white"
                />
              </div>
            ) : (
              <p className="text-white/50 text-sm mt-2">لا يوجد شعار بعد</p>
            )}
          </div>

          {/* الخلفية */}
          <div>
            <label className="label">الخلفية</label>
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" onChange={onUploadBg} disabled={saving || loadingInfo} />
              {(saving || loadingInfo) && <span className="text-white/70 text-sm">...جاري المعالجة</span>}
            </div>
            {bgUrl ? (
              <div className="mt-3">
                <Image
                  src={bgUrl}
                  alt="Background"
                  width={480}
                  height={220}
                  className="rounded-xl border border-white/10 object-cover"
                />
              </div>
            ) : (
              <p className="text-white/50 text-sm mt-2">لا توجد خلفية بعد</p>
            )}
          </div>
        </div>
      </section>

      {/* استيراد القائمة من JSON */}
      <section className="card p-5">
        <h2 className="font-bold mb-3">استيراد القائمة (JSON)</h2>
        <p className="text-white/70 mb-4">
          ارفع ملف JSON بصيغة متداخلة أو مسطّحة. سيتم تفريغ المجموعات والأصناف القديمة واستبدالها بالجديدة.
        </p>
        <div className="flex items-center gap-3">
          <button className="btn" onClick={() => fileRef.current?.click()} disabled={importBusy}>
            {importBusy ? 'جارِ الاستيراد…' : 'رفع ملف JSON'}
          </button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={handleImport} />
        </div>
      </section>
    </>
  )
}
