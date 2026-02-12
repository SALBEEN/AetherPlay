import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

//configuring cloudinary

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// async method as a utils for multiple usage
const uploadFileCloudinary = async (localFileUrl) => {
  try {
    if (!localFileUrl) return null;

    // upload file in cloudinary (cloudinary is already v2 via the import above)
    const response = await cloudinary.uploader.upload(localFileUrl, {
      resource_type: "auto",
    });

    // remove the local file after successful upload if it exists
    try {
      if (fs.existsSync(localFileUrl)) fs.unlinkSync(localFileUrl);
    } catch (err) {
      // non-fatal: log and continue
      console.warn("Could not remove local file:", err.message || err);
    }

    console.log("File uploaded to cloudinary successfully...!!!");
    return response;
  } catch (error) {
    // attempt to remove the local file when upload fails
    try {
      if (localFileUrl && fs.existsSync(localFileUrl))
        fs.unlinkSync(localFileUrl);
    } catch (err) {
      console.warn(
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

// cloudinary.v2.uploader
//   .upload("dog.mp4", {
//     resource_type: "video",
//     public_id: "my_dog",
//     overwrite: true,
//     notification_url: "https://mysite.example.com/notify_endpoint",
//   })
//   .then((result) => console.log(result));
