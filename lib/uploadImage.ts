// lib/uploadImage.ts
export async function uploadImageToCloudinary(file: File): Promise<string> {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloud || !preset) {
    throw new Error('Cloudinary env vars missing (cloud name or upload preset).');
  }

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', preset);

  const res = await fetch('https://api.cloudinary.com/v1_1/${cloud}/image/upload', {
    method: 'POST',
    body: form
  });

  const text = await res.text(); // اقرأ النص دائماً أولاً
  if (!res.ok) {
    // حاول استخراج رسالة Cloudinary
    try {
      const err = JSON.parse(text);
      throw new Error(err?.error?.message || Upload failed: ${res.status});
    } catch {
      throw new Error(Upload failed: ${res.status} ${text});
    }
  }

  const data = JSON.parse(text);
  if (!data?.secure_url) {
    throw new Error('Upload succeeded but no secure_url returned.');
  }
  return data.secure_url as string;
}
