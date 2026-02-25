import {GoogleGenerativeAI} from "@google/generative-ai";
import { imageToBase64 } from "../utils/imageToBase64.js";
import { analyzePrompt } from "../prompts/analyze.prompt.js";
import dotenv from "dotenv"

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({model:"gemini-3-flash-preview"});

export async function analyzeScreenshot(filepath){
    try{
        console.log("🔍 Starting screenshot analysis...");
        const imageData = imageToBase64(filepath);
        console.log(`📸 Image converted — type: ${imageData.mimeType}`);

        const imagePart = {
            inlineData:{
                data:imageData.base64,
                mimeType:imageData.mimeType,
            },
        };

        console.log("🤖 Sending to Gemini Vision...");
        const result = await model.generateContent([analyzePrompt,imagePart]);

        const rawResponse = result.response.text();
        console.log("Gemini responded successfully");

        const parsedReport = parseGeminiResponse(rawResponse);

        return {
            success:true,
            data:parsedReport,
        };

    
    }

    catch(error){
        console.log("❌ Gemini analysis failed:", error.message);
        return {
            success:false,
            error:error.message,
        };
    }


}

function parseGeminiResponse(rawResponse) {
  try {
    let cleaned = rawResponse.trim();

    // Remove markdown code blocks if present
    cleaned = cleaned.replace(/^```json\s*/i, "");
    cleaned = cleaned.replace(/^```\s*/i, "");
    cleaned = cleaned.replace(/```\s*$/i, "");

    const parsed = JSON.parse(cleaned.trim());

    console.log(`📊 Screenshot type detected: ${parsed.screenshotType}`);
    console.log(`🎯 Confidence: ${parsed.confidence}`);

    return parsed;

  } catch (parseError) {
    console.error("⚠️ Failed to parse Gemini response as JSON");
    return {
      screenshotType: "unknown",
      title: "Analysis Incomplete",
      summary: "The AI response could not be parsed correctly.",
      description: rawResponse,
      keyInsights: [],
      trendAnalysis: null,
      errorExplanation: null,
      recommendations: [],
      metrics: { extracted: null },
      confidence: "low",
    };
  }
}
