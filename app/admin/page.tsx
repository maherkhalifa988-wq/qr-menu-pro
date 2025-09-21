'use client'
import { useEffect, useState } from 'react'
import AdminNav from '@/components/AdminNav'
import { signInWithPasscode } from '@/lib/authClient'
import AdminBrandSection from './AdminBrandSection'
import AdminCategoriesManager from './AdminCategoriesManager'
import AdminItemsManager from './AdminItemsManager'
import ImportFromJsonButton from './ImportFromJsonButton'

export default function AdminPage() {
  const [rid, setRid] = useState('al-nakheel')

  useEffect(() => {
    (async () => {
      const pass = window.prompt('ادخل كلمة سر الادمن') || ''
      const role = await signInWithPasscode(pass).catch(() => {
        alert('كلمة السر غير صحيحة'); location.href = '/'; return null
      })
      if (role !== 'admin') { alert('ليست لديك صلاحية الادمن'); location.href = '/' }
    })()
  }, [])

  return (
    <main className="container mx-auto p-6">
      <AdminNav />

      <section className="card p-5 mb-4">
        <h1 className="text-2xl font-bold mb-2">لوحة الإدارة</h1>
        <p className="text-white/70 mb-4">إدارة الهوية، المجموعات، الأصناف، والأسعار</p>
        <label className="label">معرّف المطعم (Restaurant ID)</label>
        <input className="input max-w-md" value={rid} onChange={e=>setRid(e.target.value)} />
      </section>

      <AdminBrandSection rid={rid} />
      <AdminCategoriesManager rid={rid} />
      <AdminItemsManager rid={rid} />

      <section className="my-6">
        <ImportFromJsonButton rid={rid} />
      </section>
    </main>
  )
}
