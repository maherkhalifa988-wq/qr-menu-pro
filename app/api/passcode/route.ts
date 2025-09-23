// app/api/passcode/route.ts
import { NextRequest, NextResponse } from 'next/server'

// 👇 نستخدم SDK المعياري لـ firebase-admin v12 (ESM)
import { getApps, initializeApp, cert, getApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

// إجبار التشغيل على Node.js (وليس Edge)
export const runtime = 'nodejs'
// منع الكاش وجعل المسار ديناميكي دائمًا
export const dynamic = 'force-dynamic'
export const revalidate = 0

/** تهيئة Firebase Admin مرة واحدة فقط */
function initAdmin() {
  if (!getApps().length) {
    const projectId   = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    let privateKey    = process.env.FIREBASE_PRIVATE_KEY

    if (!projectId||!clientEmail||!privateKey) {
      throw new Error(
        'Missing FIREBASE_* env vars (FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY)'
      )
    }

    // بعض البيئات تحفظ \n كنص
    privateKey = privateKey.replace(/\\n/g, '\n')

    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    })
  }
  return getApp()
}

/** GET /api/passcode?code=XXXX  */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const raw = sp.get('code') ?? sp.get('passcode') ?? ''
    const code = raw.toString().trim()

    if (!code) {
      return NextResponse.json({ error: 'Passcode required' }, { status: 400 })
    }

    // اقرأ كلمات السر من الـ Env
    const adminPass  = process.env.ADMIN_PASS  || ''
    const editorPass = process.env.EDITOR_PASS || ''

    let role: 'admin' | 'editor' | null = null
    if (adminPass && code === adminPass) role = 'admin'
    else if (editorPass && code === editorPass) role = 'editor'

    if (!role) {
      return NextResponse.json({ error: 'Invalid passcode' }, { status: 401 })
    }

    // أنشئ توكين مخصص مع claim للدور
    const app  = initAdmin()
    const auth = getAuth(app)
    const uid  = 'passcode:${role}'

    const token = await auth.createCustomToken(uid, { role })

    return NextResponse.json({ role, token }, { status: 200 })
  } catch (err) {
    console.error('PASSCODE_API_ERROR:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
