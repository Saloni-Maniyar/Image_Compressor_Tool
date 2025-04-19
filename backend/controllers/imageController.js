// const fs = require("fs");
// const path = require("path");
// const sharp = require("sharp");
// const mime = require("mime-types");

// const PORT = process.env.PORT || 5000;

// const uploadImages = async (req, res) => {
//   const quality = parseInt(req.body.quality || "60");
//   const results = [];

//   for (const file of req.files) {
//     const ext = mime.extension(file.mimetype);
//     const outputFile = `uploads/compressed_${Date.now()}_${file.originalname}`;

//     try {
//       if (ext === "svg") {
//         await fs.promises.writeFile(outputFile, file.buffer);
//       } else {
//         let image = sharp(file.buffer).resize({ width: 800 });

//         if (ext === "jpeg" || ext === "jpg") {
//           image = image.jpeg({ quality });
//         } else if (ext === "png") {
//           image = image.png({ quality });
//         } else if (ext === "webp") {
//           image = image.webp({ quality });
//         } else if (ext === "gif") {
//           image = image.gif(); // Only first frame
//         } else {
//           image = image.jpeg({ quality });
//         }

//         await image.toFile(outputFile);
//       }

//       const stats = fs.statSync(outputFile);
//       results.push({
//         originalName: file.originalname,
//         originalSizeKB: Math.round(file.size / 1024),
//         compressedSizeKB: Math.round(stats.size / 1024),
//         downloadUrl: `http://localhost:${PORT}/api/image/download/${path.basename(outputFile)}`
//       });

//     } catch (err) {
//       console.error("Error compressing", file.originalname, err);
//     }
//   }

//   res.json(results);
// };

// const downloadImage = (req, res) => {
//   const filename = req.params.filename;
//   const filepath = path.join(__dirname, "../uploads", filename);
//   res.download(filepath);
// };

// module.exports = {
//   uploadImages,
//   downloadImage
// };







const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const mime = require("mime-types");

const PORT = process.env.PORT || 5000;

// Supported image formats
const SUPPORTED_FORMATS = ["jpeg", "jpg", "png", "webp", "gif", "svg"];

const uploadImages = async (req, res) => {
  const quality = parseInt(req.body.quality || "60");
  const results = [];
  const errors = [];

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No files were uploaded",
      results: [],
      errors: [],
    });
  }

  // Create uploads directory if it doesn't exist
  if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
  }

  for (const file of req.files) {
    const ext =
      mime.extension(file.mimetype) ||
      path.extname(file.originalname).slice(1).toLowerCase();

    if (!SUPPORTED_FORMATS.includes(ext)) {
      errors.push({
        originalName: file.originalname,
        error: `nsupported file format: ${ext || "unknown"}`,
      });
      continue;
    }

    const outputFilename = `compressed_${Date.now()}_${file.originalname}`;
    const outputFile = path.join("uploads", outputFilename);

    try {
      if (ext === "svg") {
        await fs.promises.writeFile(outputFile, file.buffer);
      } else {
        let image = sharp(file.buffer);

        // Resize only if not SVG
        image = image.resize({
          width: 800,
          withoutEnlargement: true,
        });

        // Format-specific compression
        if (ext === "jpeg" || ext === "jpg") {
          image = image.jpeg({ quality });
        } else if (ext === "png") {
          image = image.png({ quality });
        } else if (ext === "webp") {
          image = image.webp({ quality });
        } else if (ext === "gif") {
          image = image.gif(); // Only processes first frame
        }

        await image.toFile(outputFile);
      }

      const stats = fs.statSync(outputFile);
      results.push({
        originalName: file.originalname,
        originalSizeKB: Math.round(file.size / 1024),
        compressedSizeKB: Math.round(stats.size / 1024),
        downloadUrl: `http://localhost:${PORT}/api/image/download/${outputFilename}`,
        format: ext,
      });
    } catch (err) {
      console.error(`Error compressing ${file.originalname}:`, err);
      errors.push({
        originalName: file.originalname,
        error: `Processing failed: ${err.message}`,
      });

      // Clean up failed file if it was created
      if (fs.existsSync(outputFile)) {
        fs.unlinkSync(outputFile);
      }
    }
  }

  res.json({
    success: errors.length === 0,
    message:
      errors.length > 0
        ? `Processed ${results.length} files, ${errors.length} failed`
        : `Successfully processed ${results.length} files`,
    results,
    errors,
  });
};

const downloadImage = (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, "../uploads", filename);

  if (!fs.existsSync(filepath)) {
    return res.status(404).json({
      success: false,
      message: "File not found",
    });
  }

  res.download(filepath, (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to download file",
      });
    }
  });
};

module.exports = {
  uploadImages,
  downloadImage,
};



