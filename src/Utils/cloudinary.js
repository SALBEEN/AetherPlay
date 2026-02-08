import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

//configuring cloudinary

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// async method as an utils for multiple usage
const uploadFileCloudinary = async (localFileUrl) => {
  try {
    if (!localFileUrl) return null;

    //upload file in cloudinary
    const response = await cloudinary.v2.uploader.upload(localFileUrl, {
      resource_type: "auto",
    });

    console.log("File uploaded to cloudinary successfully...!!!");
    return response;
  } catch (error) {
    fs.unlinkSync(localFileUrl); //remove the locally uploaded file after upload operation failed...!!!
    console.log("File uploading failed...!!!");
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
