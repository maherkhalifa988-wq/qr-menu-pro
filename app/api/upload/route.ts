// app/api/upload/route.ts
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file' }, { status: 400 })
    }

    const cloud = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    if (!cloud  !apiKey  !apiSecret) {
      return NextResponse.json({ error: 'Cloudinary server ENV missing' }, { status: 500 })
    }

    // نحول الملف إلى Blob/Stream لتمريره إلى Cloudinary
    const bodyForm = new FormData()
    bodyForm.append('file', file)
    bodyForm.append('upload_preset', '') // لا نستخدم preset، سنوقع الطلب
    bodyForm.append('timestamp', String(Math.floor(Date.now() / 1000)))
    // ملاحظة: سنوقّع بدون SDK باستخدام الـ signature:
    // لسهولة التنفيذ بدون مكتبات إضافية، نرسل api_key و signature جاهزة:
    // لكن الأسهل: استدعاء endpoint الموقّع via basic auth؟
    // Cloudinary لا يدعم basic auth مباشرة، لذا نوقّع يدوياً:

    // نبني السلسلة للتوقيع: فقط الحقول المستخدمة (ملف + timestamp)
    const paramsToSign = new URLSearchParams()
    paramsToSign.set('timestamp', bodyForm.get('timestamp') as string)
    const toSign = Array.from(paramsToSign.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => ${k}=${v})
      .join('&') + apiSecret

    // نحتاج sha1 للتوقيع:
    const encoder = new TextEncoder()
    const data = encoder.encode(toSign)
    const hashBuffer = await crypto.subtle.digest('SHA-1', data)
    const signature = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    bodyForm.set('signature', signature)
    bodyForm.set('api_key', apiKey)

    const uploadRes = await fetch('https://api.cloudinary.com/v1_1/${cloud}/image/upload', {
      method: 'POST',
      body: bodyForm,
    })

    const text = await uploadRes.text()
    if (!uploadRes.ok) {
      let msg = text
      try { msg = JSON.parse(text)?.error?.message || msg } catch {}
      return NextResponse.json({ error: msg }, { status: uploadRes.status })
    }

    const json = JSON.parse(text)
    // أهم شيء: secure_url
    return NextResponse.json({ url: json.secure_url }, { status: 200 })
  } catch (err: any) {
    console.error('UPLOAD_API_ERROR', err)
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 })
  }
}
