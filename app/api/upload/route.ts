// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: NextRequest) {
  try {
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

    if (!cloud || !preset) {
      return NextResponse.json(
        { error: 'Cloudinary ENV vars are missing' },
        { status: 500 },
      )
    }

    const form = await req.formData()
    const file = form.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file' }, { status: 400 })
    }

    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', preset)

    const cldUrl = 'https://api.cloudinary.com/v1_1/${cloud}/image/upload'
    const res = await fetch(cldUrl, { method: 'POST', body: fd })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return NextResponse.json(
        { error: 'Cloudinary upload failed: ${res.status} ${text}' },
        { status: 502 },
      )
    }

    const data = await res.json()
    // أهم قيمة عادةً:
    const secureUrl = data.secure_url as string
    return NextResponse.json({ url: secureUrl, data }, { status: 200 })
  } catch (err: any) {
    console.error('UPLOAD_API_ERROR:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
