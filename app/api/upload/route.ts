import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const cloud = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    if (!cloud ||!apiKey||!apiSecret) {
      return NextResponse.json({ error: 'Cloudinary server ENV missing' }, { status: 500 })
    }
    cloudinary.config({ cloud_name: cloud, api_key: apiKey, api_secret: apiSecret })

    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())

    const url = await new Promise<string>((resolve, reject) => {
      const s = cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'qr-menu' },
        (err, res) => err ? reject(err) : resolve(res?.secure_url || ''))
      s.end(buffer)
    })

    if (!url) return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    return NextResponse.json({ url }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}
