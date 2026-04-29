// ...existing code...
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Resolve Cloudinary env names (support common variants)
const cloudName =
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_API_NAME ||
  process.env.CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY;
const apiSecret =
  process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET;

// Fail fast in production when config is missing so issues are obvious
if (!cloudName || !apiKey || !apiSecret) {
  const missing = [
    !cloudName && "CLOUDINARY_CLOUD_NAME or CLOUDINARY_API_NAME",
    !apiKey && "CLOUDINARY_API_KEY",
    !apiSecret && "CLOUDINARY_API_SECRET",
  ]
    .filter(Boolean)
    .join(", ");
  // Log a clear message and throw — prevents silent misconfig in prod
  console.error(
    `Missing Cloudinary configuration: ${missing}. Please set the env variables correctly.`,
  );
  throw new Error(
    `Cloudinary configuration missing: ${missing}. See README for required env vars.`,
  );
}

// configuring cloudinary with resolved values
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

// async method as a utils for multiple usage
const uploadFileCloudinary = async (localFileUrl) => {
  try {
    if (!localFileUrl) return null;

    // upload file in cloudinary (cloudinary is already v2 via the import above)
    const response = await cloudinary.uploader.upload(localFileUrl, {
      resource_type: "auto",
      folder: "videos",
    });

    const PublicId = response.public_id;

    // remove the local file after successful upload if it exists
    try {
      if (fs.existsSync(localFileUrl)) fs.unlinkSync(localFileUrl);
    } catch (err) {
      // non-fatal: log and continue
      console.warn("Could not remove local file:", err.message || err);
    }

    console.log("File uploaded to cloudinary successfully...!!!");
    // return response;
    return { url: response.secure_url, public_id: PublicId };
  } catch (error) {
    // attempt to remove the local file when upload fails
    try {
      if (localFileUrl && fs.existsSync(localFileUrl))
        fs.unlinkSync(localFileUrl);
    } catch (err) {
      console.waorn(
        "Could not remove local file after failed upload:",
        err.message || err,
      );
    }

    console.error(
      "File uploading failed...!!!",
      error && error.message ? error.message : error,
    );
    // Return null so callers can handle upload failure explicitly
    return null;
  }
};

export { uploadFileCloudinary };

// ...existing code...
