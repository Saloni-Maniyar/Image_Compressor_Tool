const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const { uploadImages, downloadImage } = require("../controllers/imageController");

router.post("/upload", upload.array("images"), uploadImages);
router.get("/download/:filename", downloadImage);

module.exports = router;
