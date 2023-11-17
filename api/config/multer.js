const path = require("path");
const crypto = require("crypto");
const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");

const storageTypes = {
  s3: multerS3({
    s3: new S3Client(),
    bucket: "altaenergia",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    key: (req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err);

        const fileName = `${hash.toString("hex")}-${file.originalname}`;

        cb(null, fileName);
      });
    },
  }),
};

module.exports = {
  //dest: path.resolve(__dirname, "..", "..", "tmp", "uploads"),
  storage: storageTypes.s3,
  limits: {
    fileSize: 50 * 1024 * 1024 * 1024,
  },
  fileFilter: function (req, file, cb) {
    const allowedMimes = [
      "video/mp4",
      "video/webm",
      "image/jpeg",
      "image/pjpeg",
      "image/png",
      "image/gif",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type."));
    }
  },
};
