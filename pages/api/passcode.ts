// pages/api/passcode.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import * as admin from 'firebase-admin'

const projectId = process.env.FIREBASE_PROJECT_ID!
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL!
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'zeina1234'

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey } as any),
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { passcode, role = 'admin' } = req.body || {}
  if (!passcode) return res.status(400).json({ error: 'Passcode required' })
  if (passcode !== ADMIN_PASSCODE) return res.status(401).json({ error: 'Invalid passcode' })

  const uid = 'qrmenu-admin' // ثابت وبسيط
  await admin.auth().setCustomUserClaims(uid, { role })
  const token = await admin.auth().createCustomToken(uid, { role })
  return res.status(200).json({ token, role })
}
