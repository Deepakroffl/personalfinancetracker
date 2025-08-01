# Personal Finance Tracker

## Overview

This is a full-stack personal finance tracker application built with the PERN stack (PostgreSQL, Express, React, Node.js). The application helps users track personal and family expenses through three main modules: user authentication, transaction management, and split expense tracking. Users can create bank accounts, add transactions, and manage group expenses with automatic split calculations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod for validation
- **Authentication**: Session-based authentication with protected routes

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with local strategy and express-session
- **Password Security**: Node.js crypto module with scrypt for password hashing
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **API Design**: RESTful API with proper error handling and request logging
- **Database ORM**: Drizzle ORM for type-safe database operations

### Database Design
- **Database**: PostgreSQL (via Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Tables**:
  - `users`: User accounts with authentication credentials
  - `bank_accounts`: User-owned bank accounts with balances
  - `transactions`: Credit/debit transactions linked to bank accounts
  - `split_expenses`: Group expenses with payer information
  - `split_participants`: Individual participants in split expenses
- **Relationships**: Proper foreign key constraints with cascade deletes

### Authentication & Authorization
- **Strategy**: Session-based authentication using Passport.js
- **Password Security**: Salted and hashed passwords using Node.js crypto scrypt
- **Session Management**: PostgreSQL-backed sessions for scalability
- **Route Protection**: Middleware-based authentication checks for API endpoints
- **Frontend Guards**: Protected route components that redirect unauthenticated users

### Data Validation
- **Schema Validation**: Zod schemas shared between client and server
- **Type Safety**: End-to-end TypeScript with shared type definitions
- **Form Validation**: React Hook Form with Zod resolvers for client-side validation
- **API Validation**: Server-side validation using the same Zod schemas

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **WebSocket Support**: For real-time database connections

### UI & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Class Variance Authority**: Component variant management

### Development Tools
- **Vite**: Fast build tool and development server
- **ESBuild**: Fast JavaScript bundler for production
- **TypeScript**: Static type checking
- **Replit Integration**: Development environment optimizations

### Authentication & Security
- **Passport.js**: Authentication middleware
- **bcryptjs**: Backup password hashing (though crypto is primarily used)
- **connect-pg-simple**: PostgreSQL session store

### Data Management
- **Drizzle ORM**: Type-safe SQL query builder
- **TanStack Query**: Server state management and caching
- **date-fns**: Date manipulation utilities

### Form Handling
- **React Hook Form**: Performant form library
- **Zod**: Schema validation and type inference
- **@hookform/resolvers**: Integration between React Hook Form and Zod