import fs from "fs";
import path from "path";

export function imageToBase64(filePath){

       const fileBuffer = fs.readFileSync(filePath);

       const base64String = fileBuffer.toString("base64");

       const extension = path.extname(filePath).slice(1).toLowerCase();

     const mimeTypes = {
     jpg: "image/jpeg",
     jpeg: "image/jpeg",
     png: "image/png",
     webp: "image/webp",
     gif: "image/gif",
  };

  const mimeType = mimeTypes[extension] || "image\png";

  return {
    base64:base64String,
    mimeType:mimeType,
  };



} 
