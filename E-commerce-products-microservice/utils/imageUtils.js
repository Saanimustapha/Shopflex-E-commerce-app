// const mongoose = require("mongoose");
// const { GridFSBucket } = require("mongodb");

// const conn = mongoose.connection;
// let gfsBucket;
// conn.once("open", () => {
  // gfsBucket = new GridFSBucket(conn.db, { bucketName: "uploads" });
// });

// const uploadToGridFS = (file) => {
  // return new Promise((resolve, reject) => {
    // const uploadStream = gfsBucket.openUploadStream(file.originalname, {
      // contentType: file.mimetype,
    // });
    // uploadStream.end(file.buffer);
    // uploadStream.on("finish", () => resolve(uploadStream.id));
    // uploadStream.on("error", reject);
  // });
// };

// module.exports = { gfsBucket, conn, uploadToGridFS };


const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

let gfsBucket;
let conn = mongoose.connection;

// This ensures that gfsBucket is initialized only after the connection is open
conn.once("open", () => {
  gfsBucket = new GridFSBucket(conn.db, { bucketName: "uploads" });
  console.log("GridFS bucket initialized");
});

const getGfsBucket = () => {
  if (!gfsBucket) {
    throw new Error("GridFS bucket is not initialized.");
  }
  return gfsBucket;
};

const uploadToGridFS = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = getGfsBucket().openUploadStream(file.originalname, {
      contentType: file.mimetype,
    });
    uploadStream.end(file.buffer);
    uploadStream.on("finish", () => resolve(uploadStream.id));
    uploadStream.on("error", reject);
  });
};

module.exports = { getGfsBucket, conn, uploadToGridFS };
