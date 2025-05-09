import React, { useState, useRef } from "react";
import axios from "axios";
import "../App.css";

function ImageCompressor() {
  const [files, setFiles] = useState([]);
  const [quality, setQuality] = useState(60);
  const [results, setResults] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const showAlert = (message) => {
    alert(message);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validImages = droppedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (validImages.length < droppedFiles.length) {
      showAlert("Only image files are allowed.");
    }

    setFiles((prev) => [...prev, ...validImages]);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validImages = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (validImages.length < selectedFiles.length) {
      showAlert("Only image files are allowed.");
    }

    setFiles((prev) => [...prev, ...validImages]);
  };

  const handleRemoveImage = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      showAlert("Please select at least one image file.");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    formData.append("quality", quality);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/image/upload",
        formData
      );
      console.log("Server response:", res.data);

      if (res.data.success) {
        setResults(res.data.results);
        setShowModal(true);
      } else {
        showAlert(res.data.message || "Failed to compress images.");
      }
    } catch (err) {
      console.error("Error uploading images:", err);
      showAlert("Failed to upload images. Please try again.");
    }
  };

  const handleClear = () => {
    setFiles([]);
    setResults([]);
    setQuality(60);
    setShowModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  return (
    <div className="container">
      <h1>🖼️ Image Compressor</h1>

      <div
        className="drop-area"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        Drag and drop images here or{" "}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          ref={fileInputRef}
        />
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Selected Images Preview</h3>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "15px",
              justifyContent: "center",
            }}
          >
            {files.map((file, i) => (
              <div
                key={i}
                className="preview-container"
                style={{
                  position: "relative",
                  width: "150px",
                  height: "150px",
                }}
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`preview-${i}`}
                  className="preview-image"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
                <span
                  onClick={() => handleRemoveImage(i)}
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    background: "red",
                    color: "white",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    textAlign: "center",
                    lineHeight: "24px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    boxShadow: "0 0 5px rgba(0,0,0,0.5)",
                  }}
                >
                  ❌
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="quality-input" style={{ marginTop: "15px" }}>
        <label>Compression (1–100): </label>
        <input
          type="number"
          min="1"
          max="100"
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
        />
      </div>

      <div style={{ marginTop: "15px" }}>
        <button onClick={handleUpload}>Compress Images</button>{" "}
        <button onClick={handleClear} style={{ marginLeft: "10px" }}>
          Clear
        </button>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2 style={{ color: "#2c82e0" }}>🧾 Compression Results</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {results.map((res, i) => (
                <li key={i} style={{ marginBottom: "20px" }}>
                  <strong>{res.originalName}</strong>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-around",
                      flexWrap: "wrap",
                      marginTop: "10px",
                    }}
                  >
                    <div>
                      <p>Original ({res.originalSizeKB}KB)</p>
                      <img
                        src={URL.createObjectURL(files[i])}
                        alt="original"
                        style={{
                          width: "150px",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          setPreviewImage(URL.createObjectURL(files[i]))
                        }
                      />
                    </div>
                    <div>
                      <p>Compressed ({res.compressedSizeKB}KB)</p>
                      <img
                        src={res.downloadUrl}
                        alt="compressed"
                        style={{
                          width: "150px",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                        onClick={() => setPreviewImage(res.downloadUrl)}
                      />
                    </div>
                  </div>
                  <a
                    href={res.downloadUrl}
                    download
                    style={{
                      display: "block",
                      marginTop: "10px",
                      color: "#2c82e0",
                    }}
                  >
                    📥 Download
                  </a>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowModal(false)}
              style={{
                backgroundColor: "#e74c3c",
                color: "white",
                padding: "8px 16px",
                border: "none",
                borderRadius: "8px",
                marginTop: "15px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {previewImage && (
        <div
          className="preview-modal"
          onClick={() => setPreviewImage(null)}
        >
          <div className="preview-image-wrapper">
            <span
              className="close-btn"
              onClick={() => setPreviewImage(null)}
            >
              ❌
            </span>
            <img src={previewImage} alt="Full Preview" />
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageCompressor;
