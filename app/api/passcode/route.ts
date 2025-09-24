// app/api/passcode/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { passcode } = await req.json()

    const admin = process.env.ADMIN_PASS
    const editor = process.env.EDITOR_PASS
    if (!admin || !editor) {
      return NextResponse.json({ ok: false, error: 'Server passcodes missing' }, { status: 500 })
    }

    let role: 'admin' | 'editor' | null = null
    if (passcode === admin) role = 'admin'
    else if (passcode === editor) role = 'editor'

    if (!role) {
      return NextResponse.json({ ok: false, error: 'INVALID_PASSCODE' }, { status: 401 })
    }

    return NextResponse.json({ ok: true, role }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Bad request' }, { status: 400 })
  }
}
