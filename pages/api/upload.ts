import type { NextApiRequest, NextApiResponse } from 'next';
import cloudinary from '@/lib/cloudinary';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const fileStr = req.body.data; // صورة بصيغة base64
      const uploadedResponse = await cloudinary.uploader.upload(fileStr, {
        folder: 'uploads', // تختار اسم المجلد اللي يروح له الصور
      });
      res.status(200).json({ url: uploadedResponse.secure_url });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
