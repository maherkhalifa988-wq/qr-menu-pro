'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { uploadImageToCloudinary } from '@/lib/uploadImage'

type Props = { rid: string }

export default function AdminBrandSection({ rid }: Props) {
  const [name, setName] = useState('مطعم النخيل')
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [bgUrl, setBgUrl] = useState<string>('')
  const [saving, setSaving] = useState(false)

  // اجلب البيانات الحالية للمطعم (الاسم/الشعار/الخلفية)
  useEffect(() => {
    (async () => {
      const ref = doc(db, 'restaurants', rid)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        const d = snap.data() as any
        setName(d.name || 'مطعم النخيل')
        setLogoUrl(d.logoUrl || '')
        setBgUrl(d.bgUrl || '')
      } else {
        // لو لم يوجد المستند ننشئه بقيم أولية
        await setDoc(ref, { name: 'مطعم النخيل', logoUrl: '', bgUrl: '' }, { merge: true })
      }
    })()
  }, [rid])

  async function onUploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setSaving(true)
    try {
      const url = await uploadImageToCloudinary(f)
      await updateDoc(doc(db, 'restaurants', rid), { logoUrl: url })
      setLogoUrl(url)
      alert('تم تحديث الشعار ✅')
    } catch (err: any) {
      alert('فشل رفع الشعار: ' + (err?.message || ''))
    } finally {
      setSaving(false)
      e.target.value = ''
    }
  }

  async function onUploadBg(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setSaving(true)
    try {
      const url = await uploadImageToCloudinary(f)
      await updateDoc(doc(db, 'restaurants', rid), { bgUrl: url })
      setBgUrl(url)
      alert('تم تحديث الخلفية ✅')
    } catch (err: any) {
      alert('فشل رفع الخلفية: ' + (err?.message || ''))
    } finally {
      setSaving(false)
      e.target.value = ''
    }
  }

  async function saveName() {
    setSaving(true)
    try {
      await updateDoc(doc(db, 'restaurants', rid), { name })
      alert('تم حفظ اسم المطعم ✅')
    } catch (err: any) {
      alert('تعذر حفظ الاسم: ' + (err?.message || ''))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="card p-5 mb-6">
      <h2 className="font-bold mb-4">الهوية (الاسم، الشعار، الخلفية)</h2>

      {/* اسم المطعم */}
      <label className="label">اسم المطعم</label>
      <div className="flex gap-2 mb-4">
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn" onClick={saveName} disabled={saving}>
          حفظ الاسم
        </button>
      </div>

      {/* الشعار */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="label">الشعار</label>
          <div className="flex items-center gap-3">
            <input type="file" accept="image/*" onChange={onUploadLogo} />
            {saving && <span className="text-white/70 text-sm">...جاري الرفع</span>}
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
          )}</div>
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
  )
}
        </div>

        {/* الخلفية */}
        <div>
          <label className="label">الخلفية</label>
          <div className="flex items-center gap-3">
            <input type="file" accept="image/*" onChange={onUploadBg} />
            {saving && <span className="text-white/70 text-sm">...جاري الرفع</span>}
