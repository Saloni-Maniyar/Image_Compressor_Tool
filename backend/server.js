// // backend/server.js
// const express = require("express");
// const multer = require("multer");
// const fs = require("fs");
// const path = require("path");
// const sharp = require("sharp");
// const mime = require("mime-types");
// const cors = require("cors");

// const app = express();
// const upload = multer();
// const PORT = 5000;

// app.use(cors());
// app.use(express.static("uploads"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Upload route
// app.post("/upload", upload.array("images"), async (req, res) => {
//   const quality = parseInt(req.body.quality || "60");
//   const results = [];

//   for (const file of req.files) {
//     const ext = mime.extension(file.mimetype);
//     const outputFile = `uploads/compressed_${Date.now()}_${file.originalname}`;

//     try {
//       // Handle SVG separately (Sharp doesn't compress SVGs)
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
//           // Fallback for unknown formats
//           image = image.jpeg({ quality });
//         }

//         await image.toFile(outputFile);
//       }

//       const stats = fs.statSync(outputFile);
//       results.push({
//         originalName: file.originalname,
//         originalSizeKB: Math.round(file.size / 1024),
//         compressedSizeKB: Math.round(stats.size / 1024),
//         downloadUrl: `http://localhost:${PORT}/download/${path.basename(outputFile)}`
//       });

//     } catch (err) {
//       console.error("Error compressing", file.originalname, err);
//     }
//   }

//   res.json(results);
// });

// // Force download route
// app.get("/download/:filename", (req, res) => {
//   const filename = req.params.filename;
//   const filepath = path.join(__dirname, "uploads", filename);
//   res.download(filepath);
// });

// app.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
// });

const express = require("express");
const cors = require("cors");
const path = require("path");
const imageRoutes = require("./routes/imageRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("uploads"));

// Routes
app.use("/api/image", imageRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
