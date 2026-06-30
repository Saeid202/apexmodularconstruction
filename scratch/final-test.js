const { GoogleGenerativeAI } = require("@google/generative-ai");

async function finalTest() {
  const apiKey = "AIzaSyB0McI-6PRtRd_V6S8ka3nYMTye9oLrZPE";
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const models = ["gemini-1.5-flash", "gemini-1.0-pro", "gemini-pro"];
  
  for (const m of models) {
    try {
      console.log(`Testing ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("test");
      console.log(`SUCCESS with ${m}!`);
      return;
    } catch (e) {
      console.log(`${m} failed: ${e.message}`);
    }
  }
  console.log("ALL MODELS FAILED. The API key is likely restricted or invalid.");
}
finalTest();
