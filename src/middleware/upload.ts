import multer from "multer";

export const avatarUpload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10M
  },
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith("image")) {
      return cb(new Error("Please upload an image"));
    }
    cb(null, true);
  },
});
