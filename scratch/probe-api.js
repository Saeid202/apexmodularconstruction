const https = require('https');

function probe() {
  const apiKey = "AIzaSyB0McI-6PRtRd_V6S8ka3nYMTye9oLrZPE";
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  console.log("Probing Google API with https...");
  
  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log("Status Code:", res.statusCode);
      try {
        const parsed = JSON.parse(data);
        if (parsed.models) {
          console.log("ALLOWED MODELS:", parsed.models.map(m => m.name).join(", "));
        } else {
          console.log("NO MODELS FOUND. Response:", data);
        }
      } catch (e) {
        console.log("PARSING ERROR. Response:", data);
      }
    });
  }).on('error', (err) => {
    console.error("Error:", err.message);
  });
}
probe();
