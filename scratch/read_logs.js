const fs = require('fs');
const logPath = 'C:\\Users\\shaba\\.gemini\\antigravity\\brain\\47fc291b-a6d4-4f63-8256-c79bef123de2\\.system_generated\\logs\\overview.txt';

if (!fs.existsSync(logPath)) {
  console.error("Log file does not exist");
  process.exit(1);
}

const fileContent = fs.readFileSync(logPath, 'utf8');
const lines = fileContent.trim().split('\n');

console.log(`Total log lines: ${lines.length}`);
for (let i = Math.max(0, lines.length - 50); i < lines.length; i++) {
  try {
    const data = JSON.parse(lines[i]);
    console.log(`--- [Line ${i}] Step ${data.step_index} | Source: ${data.source} | Type: ${data.type} ---`);
    if (data.content) {
      console.log(`Content:\n${data.content.substring(0, 1000)}\n`);
    } else if (data.tool_calls) {
      console.log(`Tool Calls: ${JSON.stringify(data.tool_calls, null, 2)}\n`);
    } else if (data.tool_outputs) {
      console.log(`Tool Outputs: ${JSON.stringify(data.tool_outputs, null, 2).substring(0, 1000)}\n`);
    }
  } catch (e) {
    console.log(`Error parsing line ${i}: ${e.message}`);
  }
}
