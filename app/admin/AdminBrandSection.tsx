'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'

type Props = { rid: string }

export default function AdminBrandSection({ rid }: Props) {
  const [loading, setLoading] = useState(true)
  const [savingName, setSavingName] = useState(false)
  const [savingLogo, setSavingLogo] = useState(false)
  const [savingBg, setSavingBg] = useState(false)

  const [name, setName] = useState('')
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [bgUrl, setBgUrl] = useState<string>('')

  // تحميل بيانات المطعم
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const ref = doc(db, 'restaurants', rid)
        const snap = await getDoc(ref)
        if (!mounted) return
        if (snap.exists()) {
          const data = snap.data() as any
          setName(data.name ?? '')
          setLogoUrl(data.logoUrl ?? '')
          setBgUrl(data.bgUrl ?? '')
        } else {
          // إن لم توجد الوثيقة، ننشئها بشكل مبدئي
          await setDoc(ref, { name: '', logoUrl: '', bgUrl: '', updatedAt: Date.now() }, { merge: true })
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [rid])

  // رفع ملف إلى Cloudinary (unsigned)
  async function uploadToCloudinary(file: File): Promise<string> {
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    if (!cloud || !preset) throw new Error('Cloudinary ENV vars are missing')

    const form = new FormData()
    form.append('file', file)
    form.append('upload_preset', preset)

    const res = await fetch('https://api.cloudinary.com/v1_1/${cloud}/image/upload', {
      method: 'POST',
      body: form,
    })
    if (!res.ok) {
      const text = await res.text()
      try {
        const err = JSON.parse(text)
        throw new Error(err?.error?.message || 'Upload failed: ${res.status}')
      } catch {
        throw new Error('Upload failed: ${res.status} ${text}')
      }
    }
    const data = await res.json()
    return data.secure_url as string
  }

  // حفظ الاسم
  async function saveName() {
    setSavingName(true)
    try {
      await updateDoc(doc(db, 'restaurants', rid), { name, updatedAt: Date.now() })
      alert('تم حفظ الاسم ✅')
    } finally {
      setSavingName(false)
    }
  }

  // رفع الشعار
  async function onUploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setSavingLogo(true)
    try {
      const url = await uploadToCloudinary(f)
      setLogoUrl(url)
      await updateDoc(doc(db, 'restaurants', rid), { logoUrl: url, updatedAt: Date.now() })
      alert('تم رفع الشعار ✅')
    } catch (err: any) {
      console.error(err)
      alert('فشل رفع الشعار: ' + (err?.message || ''))
    } finally {
      setSavingLogo(false)
      e.target.value = ''
    }
  }

  // رفع الخلفية
  async function onUploadBg(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setSavingBg(true)
    try {
      const url = await uploadToCloudinary(f)
      setBgUrl(url)
      await updateDoc(doc(db, 'restaurants', rid), { bgUrl: url, updatedAt: Date.now() })
      alert('تم رفع الخلفية ✅')
    } catch (err: any) {
      console.error(err)
      alert('فشل رفع الخلفية: ' + (err?.message || ''))
    } finally {
      setSavingBg(false)
      e.target.value = ''
    }
  }

  if (loading) {
    return (
      <section className="card p-5 my-6">
        <div className="text-white/70">...جارِ تحميل بيانات المطعم</div>
      </section>
    )
  }

  return (
    <section className="card p-5 my-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold">الهوية (الشعار/الخلفية/الاسم)</h2>
      </div>
{/* اسم المطعم */}
      <div className="mb-6">
        <label className="label">اسم المطعم</label>
        <div className="flex gap-2 max-w-xl">
          <input
            className="input flex-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اكتب اسم المطعم"
          />
          <button className="btn" onClick={saveName} disabled={savingName}>
            {savingName ? 'جارٍ الحفظ…' : 'حفظ الاسم'}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* الشعار */}
        <div>
          <label className="label">الشعار</label>
          <div className="flex items-center gap-3">
            <input type="file" accept="image/*" onChange={onUploadLogo} disabled={savingLogo} />
            {savingLogo && <span className="text-white/70 text-sm">...جارٍ الرفع</span>}
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
            <input type="file" accept="image/*" onChange={onUploadBg} disabled={savingBg} />
            {savingBg && <span className="text-white/70 text-sm">...جارٍ الرفع</span>}
          </div>
          {bgUrl ? (
            <div className="mt-3">
              <Image
                src={bgUrl}
                alt="Background"
                width={500}
                height={280}
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
