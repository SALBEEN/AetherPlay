const getHLSUrl = (publicId) => {
  // Remove any accidental file extension
  const cleanId = publicId.replace(/\.(mp4|mov|avi|mkv|webm)$/i, "");

  return `https://res.cloudinary.com/dphbhc0fp/video/upload/sp_auto/${cleanId}.m3u8`;
};

export { getHLSUrl };
