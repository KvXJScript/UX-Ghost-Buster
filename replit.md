# UX Ghost Buster

## Overview
AI-powered UX accessibility auditor that analyzes websites through the eyes of diverse user personas ("ghosts"). Uses Gemini AI to identify UX issues, generate remediation code snippets, and provide reasoning logs ("Thought Signatures").

## Architecture
- **Frontend**: React + Vite + Tailwind CSS + Shadcn UI + Framer Motion
- **Backend**: Express.js + Drizzle ORM + PostgreSQL
- **AI**: Google Gemini (via Replit AI Integrations) for multimodal UX analysis
- **Routing**: wouter for client-side routing
- **State**: TanStack React Query for server state management

## Database Schema
- `audits`: Stores target URLs, status (pending/analyzing/completed), findings counts, reasoning logs
- `ghost_sessions`: Persona-based analysis sessions linked to audits
- `findings`: Individual UX bugs with severity, category, element location, WCAG criteria
- `remediations`: AI-generated code fixes (CSS/TSX) linked to findings

## Key Pages
- `/` - Dashboard with audit list and stats
- `/new-audit` - Create new audit with persona selection
- `/audit/:id` - Detailed audit view with findings by persona, expandable remediation code

## API Endpoints
- `GET /api/audits` - List all audits
- `GET /api/audits/:id` - Get single audit
- `POST /api/audits` - Create audit (triggers AI analysis)
- `GET /api/audits/:id/sessions` - Get ghost sessions for audit
- `GET /api/audits/:id/findings` - Get findings for audit
- `GET /api/audits/:id/remediations` - Get remediations for audit

## Running
- `npm run dev` starts both frontend and backend on port 5000
- `npm run db:push` syncs database schema

## Design
- Dark mode default with light mode toggle
- Purple primary color (#7c3aed)
- Uses Inter/Open Sans font family
