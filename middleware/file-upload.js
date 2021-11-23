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

const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "uploads/images");
  },
  filename: (req, file, cb) => {
    const ext = MIME_TYPE_MAP[file.mimetype]; // extract the extension from the image file
    cb(null, uuidv4() + "." + ext);
  },
});

const multerS3Config = multerS3({
  s3: s3Config,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  acl: "public-read",
  bucket: bucketName,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    console.log(file);
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const fileUpload = multer({
  limits: 500000,
  storage: multerS3Config,
  fileFilter: fileFilter,
});

const deleteImage = (key) => {
  s3Config.deleteObject({ Bucket: bucketName, Key: key }, (err, data) => {
    console.log(err);
    console.log(data);
  });
};

exports.fileUpload = fileUpload;
exports.deleteImage = deleteImage;
