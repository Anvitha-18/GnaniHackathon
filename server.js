
require("dotenv").config();

const express = require("express");
const multer = require("multer");

const app = express();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

// Generate voice embedding
app.post(
    "/api/voices/embeddings",
    upload.single("audio_file"),
    async (req, res) => {
        try {
            // Check whether a file was uploaded
            if (!req.file) {
                return res.status(400).json({
                    error: "Please upload an audio file."
                });
            }
            // Prepare the multipart request for Gnani
            const formData = new FormData();
            formData.append(
                "audio_file",
                new Blob([req.file.buffer], {
                    type: req.file.mimetype
                }),
                req.file.originalname
            );

            // Send audio to Gnani
            const response = await fetch(
                "https://api.vachana.ai/api/v1/tts/voice-clone/embeddings",
                {
                    method: "POST",
                    headers: {
                        "X-API-Key-ID": process.env.GNANI_API_KEY
                    },
                    body: formData
                }
            );

            // Read the API response
            const result = await response.json();

            if (!response.ok) {
                return res.status(response.status).json(result);
            }

            // Return the generated embedding
            return res.status(200).json(result);

        } catch (error) {
            console.error("Error:", error);

            return res.status(500).json({
                error: "Failed to generate voice embedding."
            });
        }
    }
);

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
