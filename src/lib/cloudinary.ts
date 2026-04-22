import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export async function uploadMedia(
  file: string,
  folder: string,
  resourceType: "image" | "video" = "image"
) {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: resourceType,
    ...(resourceType === "image" && { max_bytes: 5_000_000 }),
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    mediaType: resourceType,
  };
}