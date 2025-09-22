// pages/api/passcode.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import * as admin from 'firebase-admin'

// --- قراءة مفاتيح Firebase Admin من env (يدعم طريقتين) ---
const fromSplitVars = (() => {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const rawKey = process.env.FIREBASE_PRIVATE_KEY
  if (!projectId || !clientEmail || !rawKey) return null
  const privateKey = rawKey.replace(/\\n/g, '\n') // محوّل \\n إلى سطور فعلية
  return { projectId, clientEmail, privateKey }
})()

const fromJsonVar = (() => {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!json) return null
  try {
    const obj = JSON.parse(json)
    return {
      projectId: obj.project_id,
      clientEmail: obj.client_email,
      privateKey: String(obj.private_key || '').replace(/\\n/g, '\n'),
    }
  } catch {
    return null
  }
})()

const adminCreds = fromSplitVars || fromJsonVar
if (!admin.apps.length && adminCreds) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: adminCreds.projectId!,
      clientEmail: adminCreds.clientEmail!,
      privateKey: adminCreds.privateKey!,
    } as any),
  })
}

// نقرأ أسماء متغيّرات مختلفة تفاديًا لاختلاف التسمية بين المشاريع
const PASSCODE_ADMIN  = process.env.PASSCODE_ADMIN  || process.env.ADMIN_PASSCODE || process.env.ADMIN_PASS || '1234'
const PASSCODE_EDITOR = process.env.PASSCODE_EDITOR || process.env.EDITOR_PASSCODE || process.env.EDITOR_PASS || '4321'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  // دعم طريقتين: GET ?code=... أو POST { passcode }
  const passcode =
    (req.method === 'GET' ? (req.query.code as string | undefined) : undefined) ||
    (req.body && (req.body.passcode as string | undefined))

  if (!passcode) return res.status(400).json({ error: 'Passcode required' })

  let role: 'admin' | 'editor' | null = null
  if (passcode === PASSCODE_ADMIN) role = 'admin'
  else if (passcode === PASSCODE_EDITOR) role = 'editor'

  if (!role) return res.status(401).json({ error: 'Invalid passcode' })

  if (!admin.apps.length) {
    return res.status(500).json({ error: 'Firebase Admin not initialized (check env vars)' })
  }

  const uid = role === 'admin' ? 'qrmenu-admin' : 'qrmenu-editor'
  await admin.auth().setCustomUserClaims(uid, { role })
  const token = await admin.auth().createCustomToken(uid, { role })
  return res.status(200).json({ token, role })
}
