require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function extract() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const buffer = fs.readFileSync("../client/package.json"); // Just testing syntax with text if no pdf, but let's test if inlineData works.
    
    // We will test on a dummy file first
  } catch(e) {
    console.error(e);
  }
}
