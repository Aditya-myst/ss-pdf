import { analyzeScreenshot } from "./services/gemini.service.js";
import path from "path";
import fs from "fs";

// ─────────────────────────────────────────────
// TEST SCRIPT — Run the full AI pipeline
// Usage: node src/test-pipeline.js
// ─────────────────────────────────────────────

async function runTest() {
  console.log("═══════════════════════════════════════");
  console.log("   ScreenReport AI — Pipeline Test     ");
  console.log("═══════════════════════════════════════\n");

  // Look for any image in a /test-images folder
  const testImagesDir = path.join(process.cwd(), "test-images");

  // Check if test-images folder exists
  if (!fs.existsSync(testImagesDir)) {
    console.log("📁 Creating test-images folder...");
    fs.mkdirSync(testImagesDir);
    console.log("✅ Created: test-images/");
    console.log("\n⚠️  Please drop a screenshot into the test-images/ folder");
    console.log("   Then run this script again.\n");
    return;
  }

  // Get all image files from test-images folder
  const supportedExtensions = [".png", ".jpg", ".jpeg", ".webp"];
  const files = fs.readdirSync(testImagesDir).filter((file) =>
    supportedExtensions.includes(path.extname(file).toLowerCase())
  );

  if (files.length === 0) {
    console.log("⚠️  No images found in test-images/ folder");
    console.log("   Drop any screenshot in there and run again.\n");
    return;
  }

  // Test with the first image found
  const testImagePath = path.join(testImagesDir, files[0]);
  console.log(`📸 Testing with: ${files[0]}\n`);

  // Run the analysis
  const result = await analyzeScreenshot(testImagePath);

  console.log("\n═══════════════════════════════════════");
  console.log("           ANALYSIS RESULT             ");
  console.log("═══════════════════════════════════════\n");

  if (result.success) {
    const r = result.data;

    console.log(`📌 Type:        ${r.screenshotType}`);
    console.log(`📌 Confidence:  ${r.confidence}`);
    console.log(`📌 Title:       ${r.title}`);
    console.log(`\n📝 Summary:\n   ${r.summary}`);
    console.log(`\n📋 Description:\n   ${r.description}`);

    console.log(`\n💡 Key Insights:`);
    r.keyInsights.forEach((insight, i) => {
      console.log(`   ${i + 1}. ${insight}`);
    });

    if (r.trendAnalysis) {
      console.log(`\n📈 Trend Analysis:\n   ${r.trendAnalysis}`);
    }

    if (r.errorExplanation) {
      console.log(`\n🐛 Error Explanation:\n   ${r.errorExplanation}`);
    }

    console.log(`\n✅ Recommendations:`);
    r.recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec}`);
    });

    if (r.metrics?.extracted) {
      console.log(`\n📊 Extracted Metrics:`);
      console.log("  ", r.metrics.extracted);
    }

    // Save full JSON output to file for inspection
    const outputPath = path.join(process.cwd(), "test-output.json");
    fs.writeFileSync(outputPath, JSON.stringify(result.data, null, 2));
    console.log(`\n💾 Full JSON saved to: test-output.json`);

  } else {
    console.log(`❌ Analysis failed: ${result.error}`);
  }

  console.log("\n═══════════════════════════════════════\n");
}

runTest();