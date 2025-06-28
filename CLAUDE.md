# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TanTime** is a comprehensive tanning salon management app built with Next.js 15 and TypeScript. The app allows users to track tanning hours, book sessions with real-time availability, manage their profile, and make purchases (both prepaid packages and pay-as-you-go sessions). It includes a complete booking system with sunbed selection, conflict prevention, and admin business analytics. The app uses Firebase for backend services and Google Genkit for AI functionality.

## Development Commands

```bash
# Development server (runs on port 9002 with Turbopack)
npm run dev

# AI/Genkit development server
npm run genkit:dev

# AI/Genkit with file watching
npm run genkit:watch

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Type checking
npm run typecheck
```

## Architecture

### Core Structure
- **Framework**: Next.js 15 with TypeScript and Turbopack
- **UI Library**: Radix UI components with custom styling
- **Styling**: Tailwind CSS with custom theme based on tanning salon branding
- **AI Integration**: Google Genkit with Gemini 2.0 Flash model
- **State Management**: React hooks for local state management

### Key Components
- **Main App**: Single-page application with tabbed navigation (src/app/page.tsx)
- **Tab Components**: 
  - **Overview**: Dashboard showing hours used, remaining balance, and quick stats
  - **Booking**: Complete booking system with sunbed selection and real-time availability
  - **Profile**: User management with prepaid packages and pay-as-you-go options
  - **Scan**: QR code simulation with sunbed selection and session booking
  - **Business** (Admin only): Analytics dashboard with customer management and revenue tracking
- **UI Components**: Comprehensive shadcn/ui component library in src/components/ui/
- **AI Integration**: Configured in src/ai/genkit.ts for AI-powered features

### Design System
- **Primary Color**: Golden yellow (#FFC107) for warmth and sun-kissed aesthetics
- **Background**: Pale cream (#FAF9F6) for soft, inviting feel
- **Accent**: Burnt orange (#CC6633) for contrast and visual interest
- **Typography**: Poppins for headlines, PT Sans for body text
- **Icons**: Lucide React icons with minimalist design

### Data Flow
- State management handled through React hooks in main page component
- Overview data (hours used, remaining balance) flows between tabs
- Purchase actions update remaining hours balance (both prepaid and pay-as-you-go)
- Scan functionality creates real bookings and deducts hours from balance
- Booking system uses real-time Firestore listeners for availability and conflict prevention
- Admin dashboard aggregates data from all users for business analytics

## Firebase Integration

The project uses Firebase for authentication and data persistence:

### Authentication
- **Firebase Auth**: User authentication with email/password
- **Auth Context**: `src/contexts/auth-context.tsx` provides authentication state management
- **Auth Hook**: `useAuth()` hook for accessing user state and auth functions

### Database
- **Firestore**: Real-time data storage with multiple collections
  - `users/{userId}`: User profiles, balances, and purchase history
  - `bookings/{bookingId}`: Session bookings with real-time availability tracking
- **Custom Hooks**: 
  - `useUserData()`: Manages user hours, purchases, and usage tracking
  - `useBookings()`: Handles booking creation, availability checking, and conflict prevention
  - `useAdmin()`: Provides admin access to all user data and business analytics
- **Real-time Updates**: Automatic sync between client and Firestore with optimistic UI updates

### Configuration
- **Environment Variables**: Configure Firebase credentials in `.env.local`
- **Firebase Config**: `src/lib/firebase.ts` initializes Firebase services
- **Required Environment Variables**:
  ```
  NEXT_PUBLIC_FIREBASE_API_KEY
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  NEXT_PUBLIC_FIREBASE_PROJECT_ID
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  NEXT_PUBLIC_FIREBASE_APP_ID
  NEXT_PUBLIC_ADMIN_EMAILS  # Comma-separated list of admin email addresses
  ```

### Data Structure
User documents in Firestore contain:
- `hoursUsedThisMonth`: Current month usage tracking
- `remaining`: Available tanning hours balance
- `purchaseHistory`: Array of purchase records
- `createdAt`/`lastUpdated`: Timestamp metadata

## Development Notes

- Port 9002 is used for development to avoid conflicts
- Turbopack is enabled for faster development builds
- The app uses a responsive design with mobile-first approach
- All components follow the established shadcn/ui patterns
- AI features are integrated through the Genkit framework for enhanced user experience