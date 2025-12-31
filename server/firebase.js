import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
let db = null;

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  // Use service account credentials from environment variables
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  }
  db = getFirestore();
} else if (process.env.FIREBASE_PROJECT_ID) {
  // Use default credentials (for local development with gcloud auth)
  if (getApps().length === 0) {
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }
  db = getFirestore();
} else {
  console.warn(
    "Firebase credentials not set; Firestore client disabled (using in-memory storage)."
  );
}

export { db };
