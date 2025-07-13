# MemeSite - Web3 Meme Coin Promotion Platform

## Overview

MemeSite is a web3 meme coin auto-promotion platform that allows users to create shareable token promotion pages in just 2 simple steps. Users pay a flat $15 USD (equivalent in various chain native tokens) and receive a fully generated, customizable website with links to major DEX platforms and social sharing capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom meme-themed color variables
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state management
- **Animations**: Framer Motion for smooth transitions and floating emoji effects
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **File Uploads**: Multer for handling logo image uploads
- **Storage**: Local file system for uploaded images
- **Session Management**: In-memory storage (development) with plans for PostgreSQL sessions

### Key Design Decisions
1. **Monorepo Structure**: Single repository with separate client/, server/, and shared/ directories
2. **Type Safety**: Full TypeScript implementation with shared schemas between frontend and backend
3. **Modern React**: Uses React 18 features without RSC (React Server Components)
4. **Lightweight Routing**: Wouter chosen over React Router for smaller bundle size
5. **Component Library**: shadcn/ui for consistent, accessible UI components

## Key Components

### Frontend Components
- **Home Page**: Two-step token creation process (chain selection + customization)
- **Token Page**: Dynamic token display with customizable themes
- **Chain Selector**: Multi-chain support (Solana, Ethereum, Base, BNB, Polygon)
- **Theme Selector**: Multiple visual themes (Dark, Light, Rainbow, Matrix)
- **Token Card**: Displays token info with DEX links and social sharing
- **Floating Emojis**: Animated background elements for meme aesthetic

### Backend Components
- **Token API**: CRUD operations for token management
- **File Upload**: Image processing and storage for token logos
- **Storage Interface**: Abstracted storage layer with in-memory implementation
- **Schema Validation**: Zod schemas for API request/response validation

### Database Schema
- **Users Table**: Basic user authentication (username, password)
- **Tokens Table**: Token information, customization options, and view counts
- **Shared Types**: TypeScript interfaces generated from Drizzle schemas

## Data Flow

1. **Token Creation Flow**:
   - User selects blockchain and enters token address
   - User uploads logo and customizes appearance
   - Payment processing (planned with Reown AppKit)
   - Token page generation at `/coin/[token-name]`

2. **Token Display Flow**:
   - Dynamic route loads token data from database
   - View count incrementation on page load
   - Theme customization updates stored in database
   - Social sharing and DEX link generation

3. **File Upload Flow**:
   - Logo images uploaded to `/uploads` directory
   - File type validation (JPEG, PNG, GIF)
   - 5MB size limit enforcement
   - Unique filename generation with timestamps

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React, Framer Motion, Radix UI components
- **Styling**: Tailwind CSS, class-variance-authority for component variants
- **Data Fetching**: TanStack React Query for server state
- **Form Handling**: React Hook Form, Hookform Resolvers
- **Validation**: Zod for schema validation
- **Date Utilities**: date-fns for date formatting

### Backend Dependencies
- **Database**: Drizzle ORM, @neondatabase/serverless for database connection
- **File Processing**: Multer for file uploads
- **API Framework**: Express.js for REST API
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Planned Integrations
- **Payment Processing**: Reown AppKit for multi-chain payments
- **DEX Integration**: Links to DexScreener, BirdEye, GeckoTerminal, GMGN
- **Social Media**: Twitter, Reddit, Telegram sharing capabilities

## Deployment Strategy

### Development Setup
- **Development Server**: Vite dev server with HMR
- **API Server**: Express with tsx for TypeScript execution
- **Database**: PostgreSQL (configured but using in-memory storage in development)
- **File Storage**: Local filesystem in `/uploads` directory

### Production Build
- **Frontend**: Vite build outputs to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: PostgreSQL with Drizzle migrations
- **Environment**: Node.js production environment

### Configuration
- **Environment Variables**: DATABASE_URL for PostgreSQL connection
- **Database Migrations**: Drizzle Kit for schema migrations
- **File Paths**: Configurable upload directory and static file serving
- **CORS**: Express middleware for cross-origin requests

The application is designed to be deployed on platforms like Replit, with development tooling integrated for the Replit environment including cartographer plugin and runtime error overlay.