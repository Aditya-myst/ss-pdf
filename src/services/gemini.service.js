import {GoogleGenerativeAI} from "@google/generative-ai";
import { imageToBase64 } from "../utils/imageToBase64";
import { analyzePrompt } from "../prompts/analyze.prompt";
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

function parseGeminiResponse(rawResponse){
    try{
        let cleaned = rawResponse.trim();
        if( cleaned.startsWith("```json")){
            cleaned = cleaned.slice(7);
        }
        if( cleaned = startsWith("```")){
            cleaned = cleaned.slice(3);
        }
        if(cleaned = endswith("```")){
            cleaned= cleaned.slice(0,-3);
        }

        const parsed = JSON.parses(cleaned.trim());

        console.log(`📊 Screenshot type detected: ${parsed.screenshotType}`);
        console.log(`🎯 Confidence: ${parsed.confidence}`);

        return parsed;
    }
     catch(parseError){
        console.log("⚠️ Failed to parse Gemini response as JSON");
        console.error("Raw response was:", rawResponse);
         return {
      screenshotType: "unknown",
      title: "Analysis Incomplete",
      summary: "The AI response could not be parsed correctly.",
      description: rawResponse, // preserve raw response for debugging
      keyInsights: [],
      trendAnalysis: null,
      errorExplanation: null,
      recommendations: [],
      metrics: { extracted: null },
      confidence: "low",
    };
    }
}

