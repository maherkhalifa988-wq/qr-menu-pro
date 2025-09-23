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

    // تهيئة Cloudinary SDK
    cloudinary.config({
      cloud_name: cloud,
      api_key: apiKey,
      api_secret: apiSecret,
    })

    // استلام الملف
    const form = await req.formData()
    const file = form.get('file') as File | null
    const folder = (form.get('folder') as string) || 'qr-menu'
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    // تحويله إلى Buffer ثم رفعه عبر stream
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const secureUrl = await new Promise<string>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder },
        (err, result) => {
          if (err) return reject(err)
          resolve(result?.secure_url || '')
        }
      )
      upload.end(buffer)
    })

    if (!secureUrl) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    return NextResponse.json({ url: secureUrl }, { status: 200 })
  } catch (err: any) {
    console.error('UPLOAD_API_ERROR:', err)
    return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 })
  }
}
