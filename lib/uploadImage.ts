// lib/uploadImage.ts
// يرفع دائمًا عبر مسار السيرفر /api/upload (موقّع)، لا يحتاج NEXT_PUBLIC_*.
export default async function uploadImage(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)

  const res = await fetch('/api/upload', { method: 'POST', body: fd })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data?.error || 'Upload failed (${res.status})')
  }
  if (!data?.url) {
    throw new Error('Upload OK but no URL returned')
  }
  return data.url as string
}
