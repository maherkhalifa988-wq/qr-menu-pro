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

    cloudinary.config({ cloud_name: cloud, api_key: apiKey, api_secret: apiSecret })

    const form = await req.formData()
    const file = form.get('file') as unknown as File
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const url = await new Promise<string>((resolve, reject) => {
      const up = cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder: 'qr-menu' },
        (err, result) => (err ? reject(err) : resolve(result?.secure_url || ''))
      )
      up.end(buffer)
    })

    if (!url) return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    return NextResponse.json({ url }, { status: 200 })
  } catch (err: any) {
    console.error('UPLOAD_API_ERROR:', err)
    return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 })
  }
}
