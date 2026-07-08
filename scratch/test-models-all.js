const { GoogleGenerativeAI } = require("@google/generative-ai");
const apiKey = "AIzaSyB0McI-6PRtRd_V6S8ka3nYMTye9oLrZPE";
const genAI = new GoogleGenerativeAI(apiKey);
async function testModel(name) {
  try {
    const model = genAI.getGenerativeModel({ model: name });
    const result = await model.generateContent("hello");
    console.log(`Model ${name} works!`);
  } catch (err) {
    console.log(`Model ${name} failed: ${err.message}`);
  }
}
async function run() {
  await testModel("gemini-1.5-flash");
  await testModel("gemini-1.5-pro");
  await testModel("gemini-2.0-flash-exp");
  await testModel("gemini-1.5-flash-latest");
}
run();
