// app/api/passcode/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = (searchParams.get('code')||searchParams.get('passcode')||'').trim()

  if (!code) return NextResponse.json({ error: 'Passcode required' }, { status: 400 })

  if (code === 'zeina1234') return NextResponse.json({ role: 'admin' })
  if (code === '4321')      return NextResponse.json({ role: 'editor' })

  return NextResponse.json({ error: 'Invalid passcode' }, { status: 401 })
}
