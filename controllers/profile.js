const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const path = require("path");
const crypto = require("crypto");
require('dotenv').config();


// connection
const conn = mongoose.connection;

// init gfs
let gfs;
conn.once("open", () => {
  // init stream
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads",
  });

  // Check if GridFS Bucket exists
  gfs.find({}).toArray((err, files) => {
    if (err) {
      console.error(err);
      return;
    }
    if (files.length > 0) {
      console.log("GridFS Bucket exists");
    } else {
      console.log("GridFS Bucket does not exist");
    }
  });
});


// Storage
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({
  storage,
});

router.post("/upload", upload.single("file"), (req, res) => {
  res.json({file : req.file});
});

router.get("/files", (req, res) => {
  gfs.find().toArray((err, files) => {
    // check for errors
    if (err) {
      console.error(err);
      return res.status(500).json({
        error: err.message
      });
    }

    // check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        error: "no files exist"
      });
    }

    return res.json(files);
  });
});

module.exports = router;
