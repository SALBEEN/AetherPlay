const getVideoUrl = (publicId) => {
  return `https://res.cloudinary.com/dphbhc0fp/video/upload/q_auto,f_auto/${publicId}.mp4`;
};

export { getHLSUrl };
