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
  // In Vercel, we need to serve static files from the public directory
  // and handle SPA routing (fallback to index.html for non-API routes)
  if (process.env.VERCEL) {
    // Try to find the public directory
    const possiblePublicDirs = [
      path.resolve(process.cwd(), "public"),
      path.resolve(__dirname, "..", "public"),
      path.resolve(process.cwd(), "dist", "public"),
      path.resolve(__dirname, "..", "dist", "public")
    ];
    
    let publicDir = null;
    for (const dir of possiblePublicDirs) {
      if (fs.existsSync(dir)) {
        publicDir = dir;
        break;
      }
    }
    
    if (publicDir) {
      console.log(`Serving static files from: ${publicDir}`);
      // List files in the directory for debugging
      try {
        const files = fs.readdirSync(publicDir);
        console.log(`Files in public directory: ${files.join(", ")}`);
        if (fs.existsSync(path.join(publicDir, "index.html"))) {
          const htmlContent = fs.readFileSync(path.join(publicDir, "index.html"), "utf-8");
          console.log("index.html found. Checking for script tags...");
          const scriptMatches = htmlContent.match(/<script[^>]*src=["']([^"']+)["']/g);
          if (scriptMatches) {
            console.log("Script tags in HTML:", scriptMatches);
          }
        }
      } catch (e) {
        console.error("Error reading public directory:", e);
      }
      // Serve static files from the public directory
      app.use(express.static(publicDir, { index: false }));
    } else {
      console.warn("Public directory not found. Static files may not be available.");
      console.warn("Checked paths:", possiblePublicDirs);
    }
    
    // Handle SPA routing - serve index.html for all non-API, non-asset routes
    app.use("*", (req, res) => {
      // Skip API routes
      if (req.path.startsWith("/api")) {
        return;
      }
      
      // Skip if it's a static asset request (should have been handled by express.static)
      const isAsset = /\.(js|css|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|json|map)$/i.test(req.path);
      if (isAsset && !res.headersSent) {
        return res.status(404).json({ message: "Asset not found" });
      }
      
      // Try to find index.html
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

