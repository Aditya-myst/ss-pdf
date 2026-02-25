import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import analyzeRoute from "./route/analyze.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check — confirms server is running
app.get("/", (req, res) => {
  res.json({
    status: "running",
    message: "ScreenReport AI backend is live",
  });
});

// Routes
app.use("/api", analyzeRoute);

// Start server
app.listen(PORT, () => {
  console.log("\n═══════════════════════════════════════");
  console.log(`  ScreenReport AI — Backend Running`);
  console.log(`  http://localhost:${PORT}`);
  console.log("═══════════════════════════════════════\n");
});