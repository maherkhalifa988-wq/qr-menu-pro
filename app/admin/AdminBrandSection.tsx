'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore'
import { uploadImageToCloudinary } from '@/lib/uploadImage'

type Props = { rid: string }

type SeedRestaurant = {
  name?: string
  logoUrl?: string
  bgUrl?: string
  categories?: Array<{
    id?: string
    name?: string
    nameAr?: string
    nameEn?: string
    order?: number
  }>
  items?: Array<{
    id?: string
    catId: string
    name?: string
    nameAr?: string
    nameEn?: string
    price?: number
    imageUrl?: string
    order?: number
  }>
}

export default function AdminBrandAndImport({ rid }: Props) {
  // حالة الهوية
  const [name, setName] = useState('مطعم النخيل')
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [bgUrl, setBgUrl] = useState<string>('')

  // حالات عامة
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [saving, setSaving] = useState(false)

  // استيراد JSON
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [importBusy, setImportBusy] = useState(false)

  // تحميل بيانات المطعم عند فتح الصفحة
  useEffect(() => {
    (async () => {
      setLoadingInfo(true)
      try {
        const ref = doc(db, 'restaurants', rid)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          const d = snap.data() as any
          setName(d.name || 'مطعم النخيل')
          setLogoUrl(d.logoUrl || '')
          setBgUrl(d.bgUrl || '')
        } else {
          // إنشاء مبدئي
          await setDoc(ref, { name: 'مطعم النخيل', logoUrl: '', bgUrl: '', createdAt: Date.now() }, { merge: true })
        }
      } finally {
        setLoadingInfo(false)
      }
    })()
  }, [rid])

  async function saveName() {
    setSaving(true)
    try {
      await updateDoc(doc(db, 'restaurants', rid), { name })
      alert('تم حفظ اسم المطعم ✅')
    } catch (e: any) {
      alert('تعذر حفظ الاسم: ' + (e?.message || ''))
    } finally {
      setSaving(false)
    }
  }

  async function onUploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setSaving(true)
    try {
      const url = await uploadImageToCloudinary(f)
      await updateDoc(doc(db, 'restaurants', rid), { logoUrl: url })
      setLogoUrl(url)
      alert('تم تحديث الشعار ✅')
    } catch (e: any) {
      alert('فشل رفع الشعار: ' + (e?.message || ''))
    } finally {
      setSaving(false)
      e.target.value = ''
    }
  }

  async function onUploadBg(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setSaving(true)
    try {
      const url = await uploadImageToCloudinary(f)
      await updateDoc(doc(db, 'restaurants', rid), { bgUrl: url })
      setBgUrl(url)
      alert('تم تحديث الخلفية ✅')
    } catch (e: any) {
      alert('فشل رفع الخلفية: ' + (e?.message || ''))
    } finally {
      setSaving(false)
      e.target.value = ''
    }
  }

  function openFilePicker() {
    fileRef.current?.click()
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setImportBusy(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text) as SeedRestaurant

      // 1) تحديث مستند المطعم
      await setDoc(doc(db, 'restaurants', rid), {
        name: data.name ?? name ?? 'مطعم النخيل',
        logoUrl: data.logoUrl ?? logoUrl ?? '',
        bgUrl: data.bgUrl ?? bgUrl ?? '',
        updatedAt: Date.now(),
      }, { merge: true })

      // 2) تفريغ المجموعات والأصناف القديمة (اختياري لكنه أنظف)
      const catsCol = collection(db, 'restaurants', rid, 'categories')
      const itemsCol = collection(db, 'restaurants', rid, 'items')
      const oldCats = await getDocs(catsCol)
      const oldItems = await getDocs(itemsCol)
      await Promise.all(oldItems.docs.map(d => deleteDoc(d.ref)))
      await Promise.all(oldCats.docs.map(d => deleteDoc(d.ref)))
      // 3) إضافة المجموعات
      // سنحافظ على خريطة (catId في JSON) -> (doc.id في فايرستور) لو احتجناها
      const createdCats = new Map<string, string>()
      for (const c of data.categories ?? []) {
        const newCatRef = await addDoc(catsCol, {
          name: c.name ?? c.nameAr ?? c.nameEn ?? '',
          nameAr: c.nameAr ?? '',
          nameEn: c.nameEn ?? '',
          order: c.order ?? 0,
          createdAt: Date.now(),
        })
        if (c.id) createdCats.set(c.id, newCatRef.id)
      }

      // 4) إضافة الأصناف
      for (const it of data.items ?? []) {
        const catId = createdCats.get(it.catId) ?? it.catId // إن لم يجد خريطة استخدم القيمة كما هي
        await addDoc(itemsCol, {
          catId,
          name: it.name ?? it.nameAr ?? it.nameEn ?? '',
          nameAr: it.nameAr ?? '',
          nameEn: it.nameEn ?? '',
          price: Number(it.price ?? 0),
          imageUrl: it.imageUrl ?? '',
          order: it.order ?? 0,
          createdAt: Date.now(),
        })
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
      {/* الهوية: الاسم / الشعار / الخلفية */}
      <section className="card p-5 mb-6">
        <h2 className="font-bold mb-4">الهوية (الاسم، الشعار، الخلفية)</h2>

        {/* اسم المطعم */}
        <label className="label">اسم المطعم</label>
        <div className="flex gap-2 mb-4">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} disabled={loadingInfo} />
          <button className="btn" onClick={saveName} disabled={saving || loadingInfo}>
            {saving ? 'جارٍ الحفظ…' : 'حفظ الاسم'}
          </button>
        </div>

        {/* الشعار */}
        <div className="grid md:grid-cols-2 gap-6">
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
                  className="rounded-xl border border-white/10"
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
                  width={400}
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
        <h2 className="font-bold mb-4">استيراد القائمة (JSON)</h2>
        <p className="text-white/70 mb-3">
          ارفع ملف JSON بصيغة تحتوي اسم المطعم والمجموعات والأصناف. سيتم تفريغ البيانات القديمة واستبدالها.
          </p>
        <div className="flex items-center gap-3">
          <button className="btn" onClick={() => fileRef.current?.click()} disabled={importBusy}>
            {importBusy ? 'جار الاستيراد…' : 'رفع ملف JSON'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            onChange={handleImport}
            hidden
          />
        </div>
      </section>
    </>
  )
}
