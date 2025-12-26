# Golf Score Tracker

A mobile-first web application for tracking golf scores during a round.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**

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

This will install all the required dependencies listed in `package.json`.

### Step 2: Environment Variables (Optional)

The application can run without a database (it uses in-memory storage by default). However, if you want to use PostgreSQL:

1. Create a `.env` file in the root directory:

```bash
# Windows (PowerShell)
New-Item .env

# Windows (Command Prompt)
type nul > .env

# Mac/Linux
touch .env
```

2. Add your database URL (if you have one):

```
DATABASE_URL=postgresql://user:password@host:port/database
```

**Note:** The app works fine without a database - it uses localStorage in the browser and in-memory storage on the server.

### Step 3: Start the Development Server

Run the development server:

```bash
npm run dev
```

This will:

- Start the Express backend server on port 5000
- Start the Vite development server with hot module replacement (HMR)
- Open the app in your browser (usually at `http://localhost:5000`)

### Step 4: Access the Application

Open your browser and navigate to:

```
http://localhost:5000
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm start` - Run the production build (requires `npm run build` first)
- `npm run db:push` - Push database schema changes (requires DATABASE_URL)

## Project Structure

```
GolfScoreTracker/
├── client/          # React frontend
│   └── src/
│       ├── pages/   # Page components
│       ├── components/  # Reusable components
│       └── lib/     # Utilities and state management
├── server/          # Express backend
│   ├── index.js     # Server entry point
│   ├── routes.js    # API routes
│   └── storage.js   # Data storage layer
└── shared/          # Shared schemas
```

## Troubleshooting

### Port Already in Use

If port 5000 is already in use, you can change it in `server/index.js`:

```javascript
const port = 5000; // Change this to another port
```

### Module Not Found Errors

If you see "Cannot find module" errors:

1. Make sure you ran `npm install`
2. Delete `node_modules` and `package-lock.json`, then run `npm install` again

### Database Connection Issues

If you're trying to use a database:

- Make sure your `DATABASE_URL` is correct
- Ensure your database server is running
- The app will work without a database (uses localStorage)

## Development Notes

- The app uses **localStorage** in the browser to persist game data
- Hot module replacement (HMR) is enabled - changes will auto-reload
- The backend API is available but not currently used by the frontend
- All game state is managed client-side using React Context

## Next Steps

1. Start the dev server: `npm run dev`
2. Open `http://localhost:5000` in your browser
3. Create a new game and start tracking scores!
