import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function log(message, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export function serveStatic(app) {
  // In Vercel, static files in the 'public' directory are served automatically by the platform
  // We only need to handle SPA routing (fallback to index.html for non-API routes)
  if (process.env.VERCEL) {
    // On Vercel, static assets are served by the platform from the 'public' directory
    // We only handle SPA routing - serve index.html for all non-API routes
    app.use("*", (req, res) => {
      // Skip API routes - they're handled separately
      if (req.path.startsWith("/api")) {
        return;
      }
      
      // Try to find index.html in the public directory
      const possiblePaths = [
        path.resolve(process.cwd(), "public", "index.html"),
        path.resolve(__dirname, "..", "public", "index.html"),
        path.resolve(process.cwd(), "dist", "public", "index.html"),
        path.resolve(__dirname, "..", "dist", "public", "index.html")
      ];
      
      for (const indexPath of possiblePaths) {
        if (fs.existsSync(indexPath)) {
          return res.sendFile(indexPath);
        }
      }
      
      // Fallback: return a basic HTML response
      res.status(200).set("Content-Type", "text/html").send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Golf Score Tracker</title>
            <meta charset="utf-8">
          </head>
          <body>
            <div id="root">Loading...</div>
            <script>
              console.error('Static files not found. Please check Vercel build configuration.');
            </script>
          </body>
        </html>
      `);
    });
    return;
  }

  // Local development: serve static files from dist/public
  const distPath = path.resolve(__dirname, "..", "dist", "public");

  if (!fs.existsSync(distPath)) {
    console.warn(
      `Warning: Could not find the build directory: ${distPath}. Static files may not be available.`
    );
    app.use("*", (_req, res) => {
      res.status(404).json({ message: "Static files not found. Please ensure the build completed successfully." });
    });
    return;
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ message: "index.html not found" });
    }
  });
}

