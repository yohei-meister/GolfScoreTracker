import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sourceDir = path.resolve(__dirname, "..", "dist", "public");
const destDir = path.resolve(__dirname, "..", "public");

if (!fs.existsSync(sourceDir)) {
  console.warn(`Source directory ${sourceDir} does not exist. Skipping copy.`);
  process.exit(0);
}

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy function
function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((file) => {
      copyRecursive(path.join(src, file), path.join(dest, file));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy all files from dist/public to public
fs.readdirSync(sourceDir).forEach((file) => {
  copyRecursive(path.join(sourceDir, file), path.join(destDir, file));
});

console.log(`Copied static files from ${sourceDir} to ${destDir}`);

