const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Mapping of lowercase to correct imports
const importMappings = {
  '@/components/ui/button': '@/components/ui/Button',
  '@/components/ui/input': '@/components/ui/Input',
  '@/components/ui/card': '@/components/ui/Card',
  '@/components/ui/select': '@/components/ui/Select',
  '@/components/ui/textarea': '@/components/ui/Textarea',
  '@/components/ui/badge': '@/components/ui/Badge',
  '@/components/ui/avatar': '@/components/ui/Avatar',
  '@/components/ui/grid': '@/components/ui/Grid',
  '@/components/ui/flex': '@/components/ui/Flex',
  '@/components/ui/container': '@/components/ui/Container',
};

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const [wrongImport, correctImport] of Object.entries(importMappings)) {
    const regex = new RegExp(
      `from ['"]${wrongImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`,
      'g'
    );
    if (regex.test(content)) {
      content = content.replace(regex, `from '${correctImport}'`);
      modified = true;
      console.log(`Fixed import in ${filePath}: ${wrongImport} -> ${correctImport}`);
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  return modified;
}

function findFilesToFix(dir) {
  const files = [];

  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and .next
        if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '.git') {
          traverse(fullPath);
        }
      } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

console.log('🔧 Fixing UI component imports...\n');

const srcDir = path.join(__dirname, '..', 'src');
const files = findFilesToFix(srcDir);

let fixedCount = 0;
for (const file of files) {
  if (fixImportsInFile(file)) {
    fixedCount++;
  }
}

console.log(`\n✅ Fixed ${fixedCount} files`);
