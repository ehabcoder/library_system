import multer from "multer";

// Some configurations for multer (we use to upload images)
const upload = multer({
  // Here I deleted the dest: 'avatar'
  // to let multer pass the image through other requests
  limits: 3000000,
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please provide an image."));
    }
    cb(undefined, true);
  },
});

export default upload;
