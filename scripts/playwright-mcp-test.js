/**
 * Playwright MCP Test Script
 * Tests page rendering, console errors, and responsive design
 */

const pages = [
  { path: '/', name: 'Homepage', description: 'Main landing page' },
  { path: '/catalog', name: 'Catalog', description: 'Product catalog page' },
  { path: '/quote-simulator', name: 'Quote Simulator', description: 'Interactive pricing calculator' },
  { path: '/samples', name: 'Samples', description: 'Sample request page' },
  { path: '/contact', name: 'Contact', description: 'Contact form page' },
  { path: '/auth/signin', name: 'Sign In', description: 'Login page' },
  { path: '/auth/register', name: 'Register', description: 'Registration page' },
  { path: '/guide/packaging-materials', name: 'Packaging Materials Guide', description: 'Guide page' },
  { path: '/guide/food-container', name: 'Food Container Guide', description: 'Guide page' },
  { path: '/service', name: 'Service', description: 'Service information page' },
];

const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1920, height: 1080 },
];

module.exports = { pages, viewports };
