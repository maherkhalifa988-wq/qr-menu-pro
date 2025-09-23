// lib/uploadImage.ts
export async function uploadImage(file: File, folder?: string): Promise<string> {
  const cloud  = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD!
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!
  if (!cloud || !preset) throw new Error('Missing Cloudinary env vars')

  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', preset)
  if (folder) form.append('folder', folder)

  const url = 'https://api.cloudinary.com/v1_1/${cloud}/image/upload'
  const res = await fetch(url, { method: 'POST', body: form })

  if (!res.ok) {
    const text = await res.text()
    throw new Error('Upload failed: ${res.status} ${text}')
  }

  const data = await res.json()
  return data.secure_url as string
}
