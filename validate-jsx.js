// Simple test to validate JSX syntax
const React = require('react');

// Read the component file
const fs = require('fs');
const path = require('path');

try {
  const componentPath = path.join(__dirname, 'src/components/layout/ImprovedHeader.tsx');
  const content = fs.readFileSync(componentPath, 'utf8');

  // Check for basic JSX balance
  const openTags = (content.match(/</g) || []).length;
  const closeTags = (content.match(/>/g) || []).length;

  console.log(`JSX validation for ImprovedHeader.tsx:`);
  console.log(`- Total opening brackets: ${openTags}`);
  console.log(`- Total closing brackets: ${closeTags}`);
  console.log(`- Balance: ${openTags - closeTags}`);

  // Check for common JSX issues
  const issues = [];

  // Check for unclosed divs
  const openDivs = (content.match(/<div[^>]*>/g) || []).length;
  const closeDivs = (content.match(/<\/div>/g) || []).length;
  if (openDivs !== closeDivs) {
    issues.push(`Unmatched div tags: ${openDivs} open, ${closeDivs} close`);
  }

  // Check for unclosed fragments
  const openFrags = (content.match(/<>/g) || []).length;
  const closeFrags = (content.match(/<\/>/g) || []).length;
  if (openFrags !== closeFrags) {
    issues.push(`Unmatched fragments: ${openFrags} open, ${closeFrags} close`);
  }

  if (issues.length > 0) {
    console.log('\nIssues found:');
    issues.forEach(issue => console.log(`- ${issue}`));
  } else {
    console.log('\n✅ No obvious JSX syntax issues detected');
  }

} catch (error) {
  console.error('Error reading file:', error.message);
}