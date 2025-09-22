'use client'

import { useEffect } from 'react'
import { signInWithPasscode } from '@/lib/authClient'

export default function AdminPage() {
  useEffect(() => {
    (async () => {
      const input = window.prompt('ادخل كلمة سر الادمن') || '';
      const pass = input.trim();
      if (!pass) { alert('لم تُدخل كلمة سر'); location.href = '/'; return; }

      try {
        const role = await signInWithPasscode(pass);
        if (role !== 'admin') {
          alert('ليس لديك صلاحية الأدمن');
          location.href = '/';
        }
      } catch (e) {
        alert('كلمة السر غير صحيحة');
        location.href = '/';
      }
    })();
  }, []);

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">لوحة الإدارة</h1>
      <p className="text-white/70">من هنا يمكنك تعديل المجموعات والأصناف والشعار والخلفية.</p>
    </main>
  )
}
