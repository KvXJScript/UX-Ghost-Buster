# UX Ghost Buster

## Overview
AI-powered UX accessibility auditor that analyzes websites through the eyes of diverse user personas ("ghosts"). Uses Gemini AI to identify UX issues, generate remediation code snippets, and provide reasoning logs ("Thought Signatures").

## Architecture
- **Frontend**: React + Vite + Tailwind CSS + Shadcn UI + Framer Motion
- **Backend**: Express.js + Drizzle ORM + PostgreSQL
- **AI**: Google Gemini (streaming via @google/genai) for UX analysis
- **Routing**: wouter for client-side routing
- **State**: TanStack React Query for server state management

## Database Schema
- `audits`: Stores target URLs, status (pending/analyzing/completed), findings counts, reasoning logs. ON DELETE CASCADE to child tables.
- `ghost_sessions`: Persona-based analysis sessions linked to audits
- `findings`: Individual UX bugs with severity, category, element location, WCAG criteria
- `remediations`: AI-generated code fixes (CSS/TSX) linked to findings

## Key Pages
- `/` - Landing page with hero, how-it-works, personas, features, FAQ, footer
- `/dashboard` - Audit list with search/filter, stats cards, delete actions
- `/new-audit` - Create new audit with persona selection (supports ?url=&personas= query params for re-audit prefill)
- `/audit/:id` - Detailed audit view with severity/search filters, copy code, export, re-audit, delete, category breakdown, WCAG refs, recommendations

## API Endpoints
- `GET /api/audits` - List all audits
- `GET /api/audits/:id` - Get single audit
- `POST /api/audits` - Create audit (triggers AI analysis)
- `DELETE /api/audits/:id` - Delete audit and cascaded data
- `GET /api/audits/:id/sessions` - Get ghost sessions for audit
- `GET /api/audits/:id/findings` - Get findings for audit
- `GET /api/audits/:id/remediations` - Get remediations for audit
- `GET /api/audits/:id/export` - Export full audit report as JSON

## Running
- `npm run dev` starts both frontend and backend on port 5000
- `npm run db:push` syncs database schema

## Design
- Dark mode default with light mode toggle
- Purple primary color (#7c3aed)
- Uses Inter/Open Sans font family
- Global ErrorBoundary for graceful crash handling
