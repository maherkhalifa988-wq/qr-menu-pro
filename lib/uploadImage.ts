// lib/uploadImage.ts
export default async function uploadImage(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)

  const res = await fetch('/api/upload', { method: 'POST', body: fd, cache: 'no-store' })

  let data: any = null
  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (!res.ok) {
    throw new Error(data?.error || 'Upload failed (${res.status})')
  }

  const url = data?.url as string | undefined
  if (!url) {
    throw new Error('Upload OK but no URL returned')
  }

  return url
}
