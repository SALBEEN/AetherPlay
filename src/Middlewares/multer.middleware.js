import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); // adding files in temp for a while
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) - we can add suffix to prevent file overwrite
    cb(null, file.originalname); //passing original name as user send as request
  },
});

export const upload = multer({ storage });
