import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const cloud = process.env.CLOUDINARY_CLOUD_NAME!
    const preset = process.env.CLOUDINARY_UPLOAD_PRESET!

    const cloudForm = new FormData()
    cloudForm.append('file', file)
    cloudForm.append('upload_preset', preset)

    const res = await fetch('https://api.cloudinary.com/v1_1/${cloud}/image/upload', {
      method: 'POST',
      body: cloudForm,
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
