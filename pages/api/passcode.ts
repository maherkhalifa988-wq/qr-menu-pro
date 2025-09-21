import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { code } = req.body as { code?: string }
  const admin = process.env.ADMIN_PASS
  const editor = process.env.EDITOR_PASS

  if (!code) return res.status(400).json({ error: 'Missing code' })

  if (code === admin) return res.status(200).json({ role: 'admin' })
  if (code === editor) return res.status(200).json({ role: 'editor' })

  return res.status(401).json({ error: 'invalid' })
}
