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

// Verify the copy worked
if (fs.existsSync(path.join(destDir, "index.html"))) {
  const htmlContent = fs.readFileSync(path.join(destDir, "index.html"), "utf-8");
  console.log("✓ index.html copied successfully");
  
  // Check for asset references
  const assetMatches = htmlContent.match(/src=["']([^"']+\.(js|css))["']/g);
  if (assetMatches) {
    console.log("Asset references found in HTML:", assetMatches.length);
    assetMatches.slice(0, 3).forEach(match => console.log("  -", match));
  }
  
  // List some files in the destination
  const destFiles = fs.readdirSync(destDir);
  console.log(`Files in public directory: ${destFiles.join(", ")}`);
  
  if (fs.existsSync(path.join(destDir, "assets"))) {
    const assetFiles = fs.readdirSync(path.join(destDir, "assets"));
    console.log(`Asset files: ${assetFiles.slice(0, 5).join(", ")}${assetFiles.length > 5 ? "..." : ""}`);
  }
} else {
  console.error("✗ ERROR: index.html was not copied!");
  process.exit(1);
}

