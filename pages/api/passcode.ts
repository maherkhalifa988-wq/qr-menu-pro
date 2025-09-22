// pages/api/passcode.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET')
      return res.status(405).json({ error: 'Method not allowed' })
    }

    // نقرأ من ?code= أو ?passcode= (أيّهما استخدمت)
    const raw = (req.query.code ?? req.query.passcode) as string | string[] | undefined
    const code = Array.isArray(raw) ? raw[0] : (raw || '').toString()

    if (!code) return res.status(400).json({ error: 'Passcode required' })

    const adminPass  = process.env.ADMIN_PASS  || ''
    const editorPass = process.env.EDITOR_PASS || ''

    if (adminPass && code === adminPass)  return res.status(200).json({ role: 'admin' })
    if (editorPass && code === editorPass) return res.status(200).json({ role: 'editor' })

    return res.status(401).json({ error: 'Invalid passcode' })
  } catch (err: any) {
    console.error('PASSCODE_API_ERROR:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
