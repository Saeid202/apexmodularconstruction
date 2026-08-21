const fs = require('fs');
const path = require('path');

function replaceColor(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.git' || file === '.next') continue;
    
    if (fs.statSync(fullPath).isDirectory()) {
      replaceColor(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.css') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      if (content.includes('#4B1D8F') || content.includes('#4B1D8F')) {
        content = content.replace(/#4B1D8F/gi, '#4B1D8F');
        changed = true;
      }
      if (content.includes('4B1D8F') || content.includes('4B1D8F')) {
          content = content.replace(/4B1D8F/gi, '4B1D8F');
          changed = true;
      }
      if (content.includes('#6B35B8') || content.includes('#6B35B8')) {
        content = content.replace(/#6B35B8/gi, '#6B35B8');
        changed = true;
      }
      if (content.includes('#3A1570') || content.includes('#3A1570')) {
        content = content.replace(/#3A1570/gi, '#3A1570');
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated colors in ${fullPath}`);
      }
    }
  }
}

replaceColor(path.join(__dirname, '..'));
console.log('Done.');
