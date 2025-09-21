// lib/uploadImage.ts
export async function uploadImageToCloudinary(file: File) {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloud || !preset) {
    throw new Error('Cloudinary env vars missing');
  }

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', preset);

  const res = await fetch('https://api.cloudinary.com/v1_1/${cloud}/image/upload', {
    method: 'POST',
    body: form
  });

  if (!res.ok) {
    try {
      const err = await res.json();
      // هنا نستخدم backticks
      throw new Error(err?.error?.message || 'Upload failed: ${res.status}');
    } catch {
      const text = await res.text();
      throw new Error('Upload failed: ${res.status} ${text}');
    }
  }

  const data = await res.json();
  return data.secure_url as string;
}
