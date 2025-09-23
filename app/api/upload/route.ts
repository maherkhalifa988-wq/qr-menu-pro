// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export async function POST(req: NextRequest) {
  try {
    const cloud     = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey    = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    if (!cloud||!apiKey||!apiSecret) {
      return NextResponse.json({ error: 'Cloudinary server ENV missing' }, { status: 500 })
    }

    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const folder = 'qr-menu'
    const timestamp = Math.floor(Date.now() / 1000)

    const toSign = 'folder=${folder}&timestamp=${timestamp}${apiSecret}'
    const signature = crypto.createHash('sha1').update(toSign).digest('hex')

    // وضع التشخيص: لو ناديت /api/upload?debug=1 يرجّع لك ما سنرسله
    if (req.nextUrl.searchParams.get('debug') === '1') {
      return NextResponse.json({
        cloud, apiKeyPresent: !!apiKey, secretPresent: !!apiSecret,
        toSign, signature, timestamp
      })
    }

    const cForm = new FormData()
    cForm.append('file', file)
    cForm.append('api_key', apiKey)
    cForm.append('timestamp', String(timestamp))
    cForm.append('signature', signature)
    cForm.append('folder', folder)

    const cloudUrl = 'https://api.cloudinary.com/v1_1/${cloud}/image/upload'
    const uploadRes = await fetch(cloudUrl, { method: 'POST', body: cForm })
    const text = await uploadRes.text()

    if (!uploadRes.ok) {
      return NextResponse.json({ error: text }, { status: 500 })
    }
    const json = JSON.parse(text)
    const secureUrl = json?.secure_url as string | undefined
    if (!secureUrl) return NextResponse.json({ error: 'Upload OK but no secure_url' }, { status: 500 })

    return NextResponse.json({ url: secureUrl }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 })
  }
}
