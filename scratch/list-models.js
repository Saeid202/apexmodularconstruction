const { GoogleGenerativeAI } = require("@google/generative-ai");

async function list() {
  const apiKey = "AIzaSyB0McI-6PRtRd_V6S8ka3nYMTye9oLrZPE";
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // There is no direct listModels in the main class, we have to use the model object or a separate fetch
    // But usually, gemini-pro is the most universal one.
    console.log("Testing gemini-pro...");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("test");
    console.log("gemini-pro works!");
  } catch (err) {
    console.error("gemini-pro failed:", err.message);
    
    console.log("Testing gemini-1.5-flash...");
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent("test");
      console.log("gemini-1.5-flash works!");
    } catch (e) {
      console.error("gemini-1.5-flash failed:", e.message);
    }
  }
}
list();
