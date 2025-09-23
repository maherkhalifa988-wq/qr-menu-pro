// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const cloud = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    // اطبع وجود المتغيّرات فقط (بدون عرض القيم)
    console.log('[UPLOAD] ENV presence:', {
      cloud: !!cloud,
      apiKey: !!apiKey,
      apiSecret: !!apiSecret,
    })

    if (!cloud||!apiKey||!apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary ENV missing on server' },
        { status: 500 }
      )
    }

    cloudinary.config({ cloud_name: cloud, api_key: apiKey, api_secret: apiSecret })

    const form = await req.formData().catch((e) => {
      console.error('[UPLOAD] formData error:', e)
      return null
    })
    if (!form) {
      return NextResponse.json({ error: 'Cannot read formData' }, { status: 400 })
    }

    const file = form.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log('[UPLOAD] file size bytes:', buffer.length)

    const url = await new Promise<string>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder: 'qr-menu' },
        (err, result) => {
          if (err) {
            console.error('[UPLOAD] cloudinary error:', err)
            return reject(err)
          }
          resolve(result?.secure_url || '')
        }
      )
      upload.end(buffer)
    })

    if (!url) {
      return NextResponse.json({ error: 'Upload returned empty URL' }, { status: 500 })
    }

    return NextResponse.json({ url }, { status: 200 })
  } catch (err: any) {
    console.error('UPLOAD_API_ERROR', err)
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
