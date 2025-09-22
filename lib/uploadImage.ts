// lib/uploadImage.ts

/**
 * رفع صورة إلى Cloudinary (unsigned upload)
 * يعتمد على متغيرات البيئة:
 * - NEXT_PUBLIC_CLOUDINARY_CLOUD
 * - NEXT_PUBLIC_CLOUDINARY_PRESET
 *
 * @param file   ملف الصورة من <input type="file">
 * @param folder مجلد اختياري داخل Cloudinary مثل: 'restaurants/<rid>/items'
 * @returns      رابط الصورة الآمن (secure_url)
 */
export async function uploadImage(file: File, folder?: string): Promise<string> {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET

  if (!cloud || !preset) {
    throw new Error('Cloudinary config missing: NEXT_PUBLIC_CLOUDINARY_CLOUD or NEXT_PUBLIC_CLOUDINARY_PRESET')
  }

  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', preset)
  if (folder) form.append('folder', folder)

  const res = await fetch('https://api.cloudinary.com/v1_1/' + cloud + '/image/upload', {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    // حاول نقرأ JSON لو فيه رسالة واضحة، وإلا اعرض النص
    try {
      const err = await res.json()
      const msg = (err && (err.error?.message || err.message)) ? err.error?.message || err.message : ''
      throw new Error('Upload failed: ' + res.status + (msg ? ' - ' + msg : ''))
    } catch {
      const text = await res.text()
      throw new Error('Upload failed: ' + res.status + ' ' + text)
    }
  }

  const data = await res.json()
  return data.secure_url as string
}
