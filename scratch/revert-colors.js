const fs = require('fs');
const path = require('path');

function revertColor(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.git' || file === '.next') continue;
    
    if (fs.statSync(fullPath).isDirectory()) {
      revertColor(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.css') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      if (content.includes('#4B1D8F') || content.includes('4B1D8F')) {
        content = content.replace(/#4B1D8F/gi, '#4B1D8F');
        content = content.replace(/4B1D8F/gi, '4B1D8F');
        changed = true;
      }
      if (content.includes('#6B35B8') || content.includes('3D2963')) {
        content = content.replace(/#6B35B8/gi, '#6B35B8');
        changed = true;
      }
      if (content.includes('#3A1570') || content.includes('1F1133')) {
        content = content.replace(/#3A1570/gi, '#3A1570');
        changed = true;
      }
      if (content.includes('#4B1D8F') || content.includes('4B1D8F')) {
        content = content.replace(/#4B1D8F/gi, '#4B1D8F');
        content = content.replace(/4B1D8F/gi, '4B1D8F');
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Reverted colors in ${fullPath}`);
      }
    }
  }
}

revertColor(path.join(__dirname, '..'));
console.log('Done.');
