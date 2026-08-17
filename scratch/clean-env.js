const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const contentBuffer = fs.readFileSync(envPath);
  console.log('Buffer length:', contentBuffer.length);
  
  // Clean null bytes and keep printable characters
  let cleanContent = '';
  for (let i = 0; i < contentBuffer.length; i++) {
    const charCode = contentBuffer[i];
    if (charCode !== 0) {
      cleanContent += String.fromCharCode(charCode);
    }
  }
  
  fs.writeFileSync(envPath, cleanContent, 'utf8');
  console.log('Cleaned file written. New length:', cleanContent.length);
} else {
  console.log('File not found');
}
