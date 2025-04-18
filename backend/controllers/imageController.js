const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const mime = require("mime-types");

const PORT = process.env.PORT || 5000;

const uploadImages = async (req, res) => {
  const quality = parseInt(req.body.quality || "60");
  const results = [];

  for (const file of req.files) {
    const ext = mime.extension(file.mimetype);
    const outputFile = `uploads/compressed_${Date.now()}_${file.originalname}`;

    try {
      if (ext === "svg") {
        await fs.promises.writeFile(outputFile, file.buffer);
      } else {
        let image = sharp(file.buffer).resize({ width: 800 });

        if (ext === "jpeg" || ext === "jpg") {
          image = image.jpeg({ quality });
        } else if (ext === "png") {
          image = image.png({ quality });
        } else if (ext === "webp") {
          image = image.webp({ quality });
        } else if (ext === "gif") {
          image = image.gif(); // Only first frame
        } else {
          image = image.jpeg({ quality });
        }

        await image.toFile(outputFile);
      }

      const stats = fs.statSync(outputFile);
      results.push({
        originalName: file.originalname,
        originalSizeKB: Math.round(file.size / 1024),
        compressedSizeKB: Math.round(stats.size / 1024),
        downloadUrl: `http://localhost:${PORT}/api/image/download/${path.basename(outputFile)}`
      });

    } catch (err) {
      console.error("Error compressing", file.originalname, err);
    }
  }

  res.json(results);
};

const downloadImage = (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, "../uploads", filename);
  res.download(filepath);
};

module.exports = {
  uploadImages,
  downloadImage
};
