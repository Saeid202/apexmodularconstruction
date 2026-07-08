const fs = require('fs');
const path = require('path');

// We'll use the API key from environment variables
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.error("No NEXT_PUBLIC_GEMINI_API_KEY found in env");
  process.exit(1);
}

const imageUrl = "https://odvgrfeponeddcottcpq.supabase.co/storage/v1/object/public/product-images/a87b8a24-6988-43ba-93af-2e84ebbcb407/1782969616548_0.jpg";

async function run() {
  console.log("Analyzing image with Gemini...");
  
  const payload = {
    contents: [
      {
        parts: [
          {
            text: `You are a high-precision image segmentation tool. Analyze the sofa in this image: ${imageUrl}.
Identify three distinct regions:
1. 'Seat Cushions' (the horizontal sitting area cushion)
2. 'Backrest Cushions' (the vertical/slanted back cushions)
3. 'Furniture Frame' (the wooden/metal armrests, legs, and back support frame)

For each region, generate a high-precision SVG polygon path (using coordinates scaled to a 100x100 grid, i.e. 0 to 100 for X and Y, with preserveAspectRatio="none").
Make sure the paths tightly outline the contours of the sofa components and exclude any white background or other regions.
Return the result strictly in JSON format as follows:
{
  "zones": [
    { "name": "Seat Cushions", "svg_path": "M ... Z" },
    { "name": "Backrest Cushions", "svg_path": "M ... Z" },
    { "name": "Furniture Frame", "svg_path": "M ... Z" }
  ]
}
Do not return any markdown or other text besides the raw JSON.`
          }
        ]
      }
    ]
  };

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Gemini API returned status ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    const text = data.candidates[0].content.parts[0].text;
    console.log("Gemini Output:");
    console.log(text);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
