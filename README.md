# Golf Score Tracker

A mobile-first web application for tracking golf scores during a round. Built with React, Vite, and Firebase Firestore.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

To check if you have them installed, run:

```bash
node --version
npm --version
```

## Local Development Setup

### Step 1: Install Dependencies

Open a terminal in the project root directory and run:

```bash
npm install
```

### Step 2: Firebase Setup

This application uses Firebase Firestore for data storage. See [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md) for detailed setup instructions.

**Quick Setup:**
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Download service account key
4. Create a `.env` file in the root directory with:
   ```
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account-email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

### Step 3: Start the Development Server

Run the full development environment (frontend + API server):

```bash
npm run dev:full
```

This will:
- Start the Vite frontend server on `http://localhost:5173`
- Start the Express API server on `http://localhost:3000`

**Alternative commands:**
- `npm run dev` - Start only the frontend (Vite)
- `npm run dev:api-local` - Start only the API server (Express)
- `npm run dev:local` - Start with Firebase Emulator (for local testing without Firebase credentials)

### Step 4: Access the Application

Open your browser and navigate to:

```
http://localhost:5173
```

## Available Scripts

- `npm run dev` - Start frontend development server (Vite)
- `npm run dev:api` - Start API server with Vercel dev (requires Vercel CLI)
- `npm run dev:api-local` - Start local Express API server
- `npm run dev:full` - Start both frontend and API server
- `npm run dev:local` - Start with Firebase Emulator
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build
- `npm run test:firebase` - Test Firebase connection locally

## Project Structure

```
GolfScoreTracker/
├── api/              # Vercel serverless functions
│   └── game/         # Game API endpoints
├── client/           # React frontend
│   └── src/
│       ├── pages/    # Page components
│       ├── components/  # Reusable components
│       └── lib/      # Utilities and state management
├── server/           # Server-side code
│   ├── dev-server.js  # Local Express server
│   ├── firebase.js    # Firebase initialization
│   └── storage.js     # Firestore storage layer
├── scripts/          # Utility scripts
└── shared/           # Shared schemas
```

## Technology Stack

- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Vercel Serverless Functions (production), Express (local development)
- **Database**: Firebase Firestore
- **State Management**: React Context API

## Deployment

This application is designed to be deployed on Vercel. See [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md) for deployment instructions.

## Troubleshooting

### API Server Not Running

If you see "Cannot connect to API server" errors:
- Make sure you're running `npm run dev:full` (not just `npm run dev`)
- Check that the API server is running on `http://localhost:3000`

### Firebase Connection Issues

- Verify your `.env` file has correct Firebase credentials
- Run `npm run test:firebase` to test the connection
- See [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md) for detailed troubleshooting

### Module Not Found Errors

1. Make sure you ran `npm install`
2. Delete `node_modules` and `package-lock.json`, then run `npm install` again
