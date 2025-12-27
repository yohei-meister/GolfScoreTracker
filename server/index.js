// Import Express framework and route/utility modules
import express from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";

// Initialize Express application
const app = express();

// Middleware: Parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Custom middleware: Log API requests with duration and response data
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Error handling middleware: Catch and format unhandled errors
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  throw err;
});

// Initialize app asynchronously
let appInitialized = false;
let initializationPromise = null;
let httpServer = null;

async function initializeApp() {
  if (appInitialized) return { app, server: httpServer };
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    // Register all API routes and get HTTP server instance
    httpServer = await registerRoutes(app);

    // Environment-based setup: Vite dev server in development, static files in production
    if (app.get("env") === "development") {
      await setupVite(app, httpServer);
    } else {
      serveStatic(app);
    }

    appInitialized = true;
    return { app, server: httpServer };
  })();

  return initializationPromise;
}

// Export handler for Vercel serverless functions
export default async function handler(req, res) {
  await initializeApp();
  return app(req, res);
}

// Traditional server mode - start listening (only if not on Vercel)
if (!process.env.VERCEL) {
  (async () => {
    const { server } = await initializeApp();
    
    const port = process.env.PORT || 5000;
    const host = process.env.HOST || "0.0.0.0";
    server.listen(port, host, () => {
      log(`serving on port ${port} (host: ${host})`);
    });
  })();
}
