import fs from 'node:fs';
import path from 'node:path';
import { getProtectedSuggestionSnippets } from './protected-suggestions.mjs';

const staticDirectory = path.join(process.cwd(), '.next', 'static');
const protectedSnippets = getProtectedSuggestionSnippets();
const clientObservableDirectories = [
  staticDirectory,
  path.join(process.cwd(), '.next', 'server', 'app'),
].filter((directory) => fs.existsSync(directory));

const readFiles = (directory, extensions) => {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return readFiles(entryPath, extensions);
    return entry.isFile() && extensions.test(entry.name)
      ? [entryPath]
      : [];
  });
};

if (!fs.existsSync(staticDirectory)) {
  console.error(`Missing build output: ${staticDirectory}. Run pnpm run build first.`);
  process.exit(1);
}

const clientFiles = clientObservableDirectories.flatMap((directory) => readFiles(
  directory,
  directory === staticDirectory
    ? /\.(?:js|mjs|css|txt|html|json)$/
    : /\.(?:rsc|json|html)$/,
));
const violations = [];
for (const file of clientFiles) {
  const content = fs.readFileSync(file, 'utf8');
  for (const snippet of protectedSnippets) {
    if (content.includes(snippet)) violations.push({ file, snippet });
  }
}

if (violations.length > 0) {
  console.error('Protected chat suggestion text leaked into public static bundles:');
  for (const violation of violations) {
    console.error(`- ${violation.file}: ${violation.snippet}`);
  }
  process.exit(1);
}

console.log(`Verified ${clientFiles.length} client-observable files; no protected suggestion text found.`);
