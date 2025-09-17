'use client'
import { useEffect, useState } from 'react'
import AdminNav from '@/components/AdminNav'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, collection, addDoc, deleteDoc, getDocs, query, orderBy, updateDoc } from 'firebase/firestore'
import { Category, Item, Restaurant } from '@/lib/types'
import { uploadImageToCloudinary } from '@/lib/uploadImage'
import { signInWithPasscode } from '@/lib/authClient'

export default function AdminPage() {
  const [rid, setRid] = useState('al-nakheel')
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)

  useEffect(() => {
    (async () => {
      const pass = window.prompt('ادخل كلمة سر الادمن') || ''
      const role = await signInWithPasscode(pass).catch(() => {
        alert('كلمة السر غير صحيحة')
        location.href = '/'
      })
      if (role !== 'admin') {
        alert('ليست لديك صلاحية الادمن')
        location.href = '/'
      }
    })()
  }, [])

  return (
    <main>
      <AdminNav />
      <section className="card p-5 mb-4">
        <h1 className="text-2xl font-bold">لوحة الادارة</h1>
        <p className="text-white/70">هنا يمكنك إدارة المطعم والمجموعات والأصناف</p>
      </section>
      {/* باقي الكود لإضافة المجموعات والأصناف سيكمل هنا */}
    </main>
  )
}
