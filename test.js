import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyBV98k7ZuLCe-4YiYMdo7qXlcBbzMRAFNA" });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: "PM of India",
  });
  console.log(response.text);
}

main();