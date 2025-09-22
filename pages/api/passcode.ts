// pages/api/passcode.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import * as admin from 'firebase-admin'

function initAdmin() {
  if (admin.apps.length) return admin.app()

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  let privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId||!clientEmail||!privateKey) {
    throw new Error('Missing Firebase Admin env: FIREBASE_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY')
  }

  // لو كانت بالمتحولات مع \n، عالجها:
  privateKey = privateKey.replace(/\\n/g, '\n')

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET')
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const raw = (req.query.code ?? req.query.passcode) as string | string[] | undefined
    const code = Array.isArray(raw) ? raw[0] : (raw || '').toString().trim()
    if (!code) return res.status(400).json({ error: 'Passcode required' })

    const adminPass  = process.env.ADMIN_PASS  || ''
    const editorPass = process.env.EDITOR_PASS || ''

    let role: 'admin' | 'editor' | null = null
    if (adminPass && code === adminPass) role = 'admin'
    if (!role && editorPass && code === editorPass) role = 'editor'
    if (!role) return res.status(401).json({ error: 'Invalid passcode' })

    // اصنع توكن مخصّص يحتوي claim الدور
    const app = initAdmin()
    const auth = app.auth()

    // يمكنك ربط UID معيّن (مثلاً حسب الدور)
    const uid = 'passcode:${role}'

    const token = await auth.createCustomToken(uid, { role })

    return res.status(200).json({ role, token })
  } catch (err: any) {
    console.error('PASSCODE_API_ERROR:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
