// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function json(data: any, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

export async function POST(req: NextRequest) {
  try {
    const cloud     = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey    = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloud||!apiKey||!apiSecret) {
      return json({ error: 'Cloudinary server ENV missing' }, 500)
    }

    // Cloudinary SDK (سيرفر)
    cloudinary.config({ cloud_name: cloud, api_key: apiKey, api_secret: apiSecret })

    const form = await req.formData()
    const file = form.get('file') as File | null
    const folder = (form.get('folder') as string) || 'qr-menu'
    if (!file) return json({ error: 'No file' }, 400)

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const secureUrl = await new Promise<string>((resolve, reject) => {
      const up = cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder },
        (err, result) => {
          if (err) return reject(err)
          resolve(result?.secure_url || '')
        }
      )
      up.end(buffer)
    })

    if (!secureUrl) return json({ error: 'Upload failed' }, 500)
    return json({ url: secureUrl }, 200)
  } catch (err: any) {
    console.error('UPLOAD_API_ERROR:', err)
    // نرجّع JSON دايمًا حتى لو انهار شيء مبكر
    return json({ error: err?.message ?? 'Internal error' }, 500)
  }
}

// اختياري: GET بسيط للتشخيص السريع
export async function GET() {
  return new NextResponse(
    'OK /api/upload (POST only). CLOUDINARY_CLOUD_NAME present=' +
      (!!process.env.CLOUDINARY_CLOUD_NAME),
    { status: 200, headers: { 'content-type': 'text/plain; charset=utf-8' } }
  )
}
