// pages/api/passcode.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const raw = (req.query.code ?? req.query.passcode) as string | string[] | undefined
  const code = Array.isArray(raw) ? raw[0] : (raw || '').toString().trim()

  if (!code) return res.status(400).json({ error: 'Passcode required' })

  if (code === 'zeina1234') return res.status(200).json({ role: 'admin' })
  if (code === '4321')      return res.status(200).json({ role: 'editor' })

  return res.status(401).json({ error: 'Invalid passcode' })
}
