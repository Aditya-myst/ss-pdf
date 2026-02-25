import express from "express";
import fs from "fs";
import { upload } from "../config/multer.js";
import { analyzeScreenshot } from "../services/gemini.service.js";

const router = express.Router();

// POST /api/analyze
// Accepts: multipart/form-data with field name "screenshot"
// Returns: structured JSON report from Gemini

router.post("/analyze", upload.single("screenshot"), async (req, res) => {
  // Check if file was actually uploaded
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "No screenshot uploaded. Send a file with field name 'screenshot'",
    });
  }

  const filePath = req.file.path;
  console.log(`\n📨 Request received — file: ${req.file.originalname}`);

  try {
    // Run AI analysis on the uploaded file
    const result = await analyzeScreenshot(filePath);

    // Delete the temp file after analysis — we don't need it anymore
    fs.unlinkSync(filePath);
    console.log("🗑️  Temp file cleaned up");

    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    // Clean up file even if analysis fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    console.error("❌ Route error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Analysis failed. Please try again.",
    });
  }
});

export default router;