import { NextResponse } from 'next/server'

// لا تُرجع إلا المتغيرات العامة NEXT_PUBLIC_ فقط
export async function GET() {
  return NextResponse.json({
    cloud: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD || null,
    preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || null,
  })
}
