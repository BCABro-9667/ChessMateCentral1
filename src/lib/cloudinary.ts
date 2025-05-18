// src/lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_NAME;
const apiKey = process.env.CLOUDINARY_KEY;
const apiSecret = process.env.CLOUDINARY_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.warn(
    'Cloudinary environment variables (CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET) are not fully defined. Image related operations might fail.'
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true, // Ensures HTTPS URLs
});

export default cloudinary;

// Example usage for uploading (NOT implemented in current API routes, for future reference):
// export async function uploadImage(filePath: string): Promise<UploadApiResponse | UploadApiErrorResponse> {
//   try {
//     const result = await cloudinary.uploader.upload(filePath, {
//       folder: 'chessmate_tournaments', // Optional: organize uploads into folders
//     });
//     return result;
//   } catch (error) {
//     console.error('Cloudinary upload error:', error);
//     return error as UploadApiErrorResponse;
//   }
// }
