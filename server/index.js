// Import Express framework and route/utility modules
import express from "express";
import { registerRoutes } from "./routes.js";
import { serveStatic, log } from "./utils.js";

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

  console.error('Express error:', err);
  if (!res.headersSent) {
    res.status(status).json({ message });
  }
});

// Initialize app asynchronously
let appInitialized = false;
let initializationPromise = null;
let httpServer = null;

async function initializeApp() {
  if (appInitialized) return { app, server: httpServer };
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    try {
      console.log('Initializing app...');
      // Register all API routes and get HTTP server instance
      httpServer = await registerRoutes(app);
      console.log('Routes registered');

      // Environment-based setup: Vite dev server in development, static files in production
      if (app.get("env") === "development") {
        console.log('Setting up Vite dev server...');
        // Dynamically import Vite only in development to avoid bundling it in production
        const { setupVite } = await import("./vite.js");
        await setupVite(app, httpServer);
      } else {
        console.log('Setting up static file serving...');
        serveStatic(app);
      }

      appInitialized = true;
      console.log('App initialized successfully');
      return { app, server: httpServer };
    } catch (error) {
      console.error('Error initializing app:', error);
      throw error;
    }
  })();

  return initializationPromise;
}

// Export handler for Vercel serverless functions
export default async function handler(req, res) {
  try {
    await initializeApp();
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
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
