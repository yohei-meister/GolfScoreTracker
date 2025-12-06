# Golf Score Tracker

## Overview

A mobile-first web application for tracking golf scores during a round. The application allows users to manage players, record scores hole-by-hole, and view real-time scoring summaries. Built with a modern full-stack architecture using React for the frontend and Express for the backend, with PostgreSQL for persistent storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tool**
- React with Vite as the build tool and development server
- TypeScript/JSX hybrid approach (components use both .tsx and .jsx extensions)
- Hot module replacement (HMR) enabled for development

**UI Component Library**
- shadcn/ui component system with Radix UI primitives
- Tailwind CSS for styling with custom CSS variables for theming
- "New York" style variant with dark mode support
- Responsive design optimized for mobile devices

**State Management & Data Fetching**
- TanStack React Query for server state management
- Custom query client configured with specific retry and refetch policies
- No window focus refetching, infinite stale time for predictable caching

**Routing & Path Resolution**
- Path aliases configured for clean imports:
  - `@/` maps to client/src
  - `@shared/` maps to shared directory
  - `@assets/` maps to attached_assets directory

### Backend Architecture

**Server Framework**
- Express.js with ESM module syntax
- TypeScript for type safety
- Custom middleware for request/response logging
- Centralized error handling middleware

**Development & Production**
- Separate index files (index.ts for development, compiled to index.js for production)
- esbuild for backend bundling in production
- Development mode runs directly with tsx

**API Structure**
- RESTful API design with `/api` prefix
- Game-centric endpoints:
  - GET `/api/game` - Retrieve current active game
  - POST `/api/game` - Create new game
  - PUT `/api/game/:id` - Update existing game
- Request/response validation using Zod schemas

### Data Storage

**Database**
- PostgreSQL via Neon serverless driver
- WebSocket support for serverless connections
- Connection pooling for efficient resource usage

**ORM & Schema Management**
- Drizzle ORM for type-safe database operations
- Schema-first approach with shared type definitions
- Database migrations managed in `/migrations` directory
- Schema validation with drizzle-zod integration

**Data Model**
- Users table with authentication support
- Games table tracking course info, hole count, completion status
- Players table for game participants
- Hole information table storing par and yardage
- Scores table for individual player performance per hole
- Relational structure with foreign keys and relations

**Storage Layer**
- DatabaseStorage class abstracts database operations
- Game hydration pattern: retrieves game with all related players, holes, and scores
- Supports finding active (incomplete) games
- CRUD operations for games with transactional integrity

### External Dependencies

**Database Services**
- Neon serverless PostgreSQL (@neondatabase/serverless)
- Requires DATABASE_URL environment variable
- WebSocket connections for serverless compatibility

**Authentication & Session Management**
- connect-pg-simple for PostgreSQL-backed sessions (dependency present but implementation not visible in provided files)

**UI Component Dependencies**
- Radix UI component primitives (accordion, dialog, dropdown, select, etc.)
- lucide-react for iconography
- class-variance-authority for component variant management
- tailwind-merge and clsx for className utilities
- cmdk for command palette functionality
- date-fns for date manipulation
- react-hook-form with @hookform/resolvers for form validation

**Development Tools**
- Replit-specific plugins for cartographer and runtime error overlay
- TypeScript with strict mode enabled
- PostCSS with Tailwind and Autoprefixer

**Third-Party Data**
- Hardcoded golf course data (Pebble Beach, Augusta National) stored in client-side courseData.js
- No external APIs for course information