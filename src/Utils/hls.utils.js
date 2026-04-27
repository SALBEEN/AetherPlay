const getHLSUrl = (publicId) => {
  return `https://res.cloudinary.com/dphbhc0fp/video/upload/sp_auto,q_auto,f_auto/${publicId}.m3u8`;
};

export { getHLSUrl };
