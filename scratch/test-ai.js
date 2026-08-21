const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testFutureTier() {
  const apiKey = "AIzaSyB0McI-6PRtRd_V6S8ka3nYMTye9oLrZPE";
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    console.log("Testing Gemini 2.5 with Sales Context...");
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: "Hello, recommend a product for 80sqm using [PRODUCT: slug] format." }] }]
    });
    
    console.log("AI RESPONSE:", result.response.text());
  } catch (err) {
    console.error("DEBUG ERROR:", err.message);
  }
}

testFutureTier();
