// app/api/passcode/route.ts
import { NextRequest, NextResponse } from 'next/server'
import admin from 'firebase-admin'

/** —— تهيئة Firebase Admin لمرة واحدة —— */
function initAdmin() {
  if (!admin.apps.length) {
    const projectId   = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    let privateKey    = process.env.FIREBASE_PRIVATE_KEY

    if (!projectId||!clientEmail||!privateKey) {
      throw new Error(
        'Missing FIREBASE_* env vars (FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY)'
      )
    }
    // بعض لوحات الاستضافة تحفظ الـ \n كنص صريح، نحولها لسطر جديد
    privateKey = privateKey.replace(/\\n/g, '\n')

    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    })
  }
  return admin
}

/** —— /api/passcode?code=XXXX —— */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const raw = searchParams.get('code') ?? searchParams.get('passcode') ?? ''
    const code = raw.toString().trim()

    if (!code) {
      return NextResponse.json({ error: 'Passcode required' }, { status: 400 })
    }

    // اقرأ كلمات السر من المتغيرات
    const adminPass  = process.env.ADMIN_PASS  || ''
    const editorPass = process.env.EDITOR_PASS || ''

    let role: 'admin' | 'editor' | null = null
    if (adminPass && code === adminPass) role = 'admin'
    else if (editorPass && code === editorPass) role = 'editor'

    if (!role) {
      return NextResponse.json({ error: 'Invalid passcode' }, { status: 401 })
    }

    // أنشئ توكن مخصص يحمل claim للدور
    const app = initAdmin()
    const auth = app.auth()
    const uid = 'passcode:${role}' // مُعرّف بسيط
    const token = await auth.createCustomToken(uid, { role })

    return NextResponse.json({ role, token })
  } catch (err: any) {
    console.error('PASSCODE_API_ERROR:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
