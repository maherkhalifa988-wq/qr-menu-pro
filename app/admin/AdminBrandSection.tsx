// app/admin/AdminBrandSection.tsx
'use client'

import React, { useState } from 'react'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { uploadImage } from '@/lib/uploadImage'

type Props = {
  rid: string // restaurant id
}

export default function AdminBrandSection({ rid }: Props) {
  const [name, setName] = useState('')
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [bgUrl, setBgUrl] = useState<string>('')
  const [saving, setSaving] = useState(false)

  async function loadCurrent() {
    if (!rid) return
    const ref = doc(db, 'restaurants', rid)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const data = snap.data() as any
      setName(data?.name ?? '')
      setLogoUrl(data?.brand?.logoUrl ?? '')
      setBgUrl(data?.brand?.bgUrl ?? '')
    } else {
      await setDoc(ref, { name: '', brand: {} }, { merge: true })
    }
  }

  async function onPickLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !rid) return
    setSaving(true)
    try {
      const url = await uploadImage(file, `restaurants/${rid}/brand`)
      setLogoUrl(url)
      await updateDoc(doc(db, 'restaurants', rid), {
        brand: { logoUrl: url, bgUrl },
      })
      alert('تم حفظ الشعار ✅')
    } catch (err: any) {
      console.error(err)
      alert('فشل رفع الشعار: ' + (err?.message || ''))
    } finally {
      setSaving(false)
      e.target.value = ''
    }
  }

  async function onPickBg(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !rid) return
    setSaving(true)
    try {
      const url = await uploadImage(file, `restaurants/${rid}/brand`)
      setBgUrl(url)
      await updateDoc(doc(db, 'restaurants', rid), {
        brand: { logoUrl, bgUrl: url },
      })
      alert('تم حفظ الخلفية ✅')
    } catch (err: any) {
      console.error(err)
      alert('فشل رفع الخلفية: ' + (err?.message || ''))
    } finally {
      setSaving(false)
      e.target.value = ''
    }
  }

  async function saveName() {
    if (!rid) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'restaurants', rid), {
        name,
        brand: { logoUrl, bgUrl },
      })
      alert('تم حفظ الاسم ✅')
    } catch (err: any) {
      console.error(err)
      alert('فشل الحفظ: ' + (err?.message || ''))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="card p-5 my-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold">الهوية (الشعار/الخلفية/الاسم)</h2>
        <button
          className="btn"
          onClick={loadCurrent}
          disabled={!rid || saving}
          title="تحميل البيانات الحالية من Firestore"
        >
          جلب البيانات الحالية
        </button>
      </div>

      {/* الاسم */}
      <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end mb-6">
        <label className="block">
          <div className="label">اسم المطعم</div>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: مطعم النخيل"
          />
        </label>
        <button className="btn" onClick={saveName} disabled={!rid || saving}>
          {saving ? '...جارِ الحفظ' : 'حفظ الاسم'}
        </button>
      </div>

      {/* الشعار */}
      <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end mb-6">
        <div>
          <div className="label mb-2">الشعار</div>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo preview"
              className="w-48 h-48 object-contain rounded border border-white/10 bg-white/5"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center rounded border border-white/10 bg-white/5 text-white/50">
              لا يوجد شعار بعد
            </div>
          )}
        </div>
        <label className="btn cursor-pointer">
          اختر ملف...
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPickLogo}
            disabled={!rid || saving}
          />
        </label>
      </div>

      {/* الخلفية */}
      <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
        <div>
          <div className="label mb-2">الخلفية</div>
          {bgUrl ? (
            <img
              src={bgUrl}
              alt="Background preview"
              className="w-full max-w-xl aspect-video object-cover rounded border border-white/10 bg-white/5"
            />
          ) : (
            <div className="w-full max-w-xl aspect-video flex items-center justify-center rounded border border-white/10 bg-white/5 text-white/50">
              لا توجد خلفية بعد
            </div>
          )}
        </div>
        <label className="btn cursor-pointer">
          اختر ملف...
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPickBg}
            disabled={!rid || saving}
          />
        </label>
      </div>
    </section>
  )
}
