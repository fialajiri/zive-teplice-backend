const multer = require("multer");
const multerS3 = require("multer-s3");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const S3 = require("aws-sdk/clients/s3");
const fs = require("fs");

const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;

const s3Config = new S3({
  region,
  accessKeyId,
  secretAccessKey,
  Bucket: bucketName,
});

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};

const fileFilter = (req, file, cb) => {
  const ext = MIME_TYPE_MAP[file.mimetype]; // extract the extension from the image file
  cb(null, uuidv4() + "." + ext);
};

const multerS3Config = (destinationPath) =>
  multerS3({
    s3: s3Config,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    bucket: bucketName,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(
        null,
        
        destinationPath +
          "/" +
          new Date().toISOString() +
          "-" +
          file.originalname
      );
    },
  });

const fileUpload = (destinationPath) =>
  multer({
    limits: 20000000,
    storage: multerS3Config(destinationPath),
    fileFilter: fileFilter,
  });


  const galleryUploadS3 = (destinationPath) => multer({
    storage: multerS3Config(destinationPath),
    limits: {fileSize: 30000000},
    fileFilter: fileFilter
  }).array('galleryImages', 150)

  // const galleryUploadS3 = multer({
  //   storage: multerS3Config('gallery'),
  //   limits: {fileSize: 15000000},
  //   fileFilter: fileFilter
  // }).array('imageImage', 100)

// const galleryUpload = ({
//   multer({
//     storage: multerS3Config('gallery'),
//     limits: { fileSize: 15000000 },
//     fileFilter: fileFilter,
//   })
// });

const deleteImage = (key) => {
  s3Config.deleteObject({ Bucket: bucketName, Key: key }, (err, data) => {});
};

exports.fileUpload = fileUpload;
exports.deleteImage = deleteImage;
exports.galleryUploadS3 = galleryUploadS3;
