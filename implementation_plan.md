# InternMatch AI - Implementation Plan

This document outlines the architecture, tech stack, and phased implementation plan for **InternMatch AI**, a full-stack SaaS application that matches students to internships based on their resume.

## Goal
Build an AI-powered internship matching platform that analyzes a user's resume via the Gemini API, normalizes job listings, and calculates a match percentage.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Google Gemini API (kept securely on the backend)
- **Auth**: JWT, bcrypt

## Architecture Overview
The application will follow a clean separation of concerns:
- **Frontend**: UI components, pages, context, and API services.
- **Backend API**: Routes → Controllers → Services → Database/External APIs.
- **Job Source Adapters**: Modular interface for fetching, normalizing, and validating job listings.

---

## 🛑 User Review Required

Please review the proposed phases below and answer the **Open Questions** before we proceed to Phase 1.

## ❓ Open Questions

To ensure the implementation exactly matches your expectations, please clarify the following:

1. **Job Sources for MVP**: Which specific job sources or APIs do you want to integrate first? Since many job APIs are paid or restricted, should I start with a **mock adapter** (providing realistic sample jobs) and maybe one public API (e.g., USAJobs API, or a generic RSS feed) to prove the architecture?
2. **PDF Extraction Library**: For parsing the PDF on the backend, is `pdf-parse` acceptable, or do you have another library in mind?
3. **Gemini Model Configuration**: Which Gemini model should be used? `gemini-1.5-flash` is usually best for fast, structured JSON extraction, while `gemini-1.5-pro` is better for complex reasoning. I recommend `gemini-1.5-flash` for the resume extraction and possibly `gemini-1.5-pro` for deep job-matching if needed.
4. **UI Components**: Do you want me to build all UI components using purely vanilla Tailwind CSS, or would you prefer I use a library like `shadcn/ui` (which uses Tailwind) to achieve a highly polished, modern SaaS look faster?

---

## Proposed Changes (Phases)

### Phase 1: Initial Setup
- Set up the monorepo structure (`frontend/` and `backend/`).
- Initialize Vite + React for frontend.
- Initialize Node.js + Express for backend.
- Set up `.env` configurations.

### Phase 2: Database & Authentication
- Setup PostgreSQL and Prisma ORM.
- Define `User` schema.
- Implement `/signup`, `/login`, and `/me` endpoints with JWT and bcrypt.
- Create frontend Auth Context and protected routes.

### Phase 3: Resume Upload & Extraction
- Build `/upload-resume` UI.
- Implement backend endpoint to receive PDF (using `multer`).
- Extract text from PDF (`pdf-parse`).

### Phase 4: Gemini AI Integration & Profile Page
- Create Gemini service to extract structured JSON from resume text.
- Define `Profile` schema in Prisma.
- Save extracted profile to DB.
- Build the `/profile` page on the frontend allowing users to edit their data.

### Phase 5: Job Database & Source Architecture
- Define `Job` schema.
- Create modular job source interfaces (`fetchJobs`, `normalizeJob`).
- Implement the first job source adapter (mock or real API based on feedback).

### Phase 6: Matching Engine
- Implement `matching.service.js` based on the specified weights (Skills 35%, Eligibility 25%, etc.).
- Add Gemini-powered semantic matching as a secondary step.
- Save matches in the database.

### Phase 7: Dashboard & Job Details
- Build `/dashboard` with job cards and match indicators.
- Build `/jobs/:id` details page.
- Implement filtering and sorting APIs and UI.

### Phase 8: Saved Jobs & Application Tracker
- Define `SavedJob` and `Application` schemas.
- Implement `/saved` jobs functionality.
- Implement manual application tracker (`/applications`).

### Phase 9: Polish, Error Handling & README
- Final UI polish (loaders, toasts, responsive design).
- Comprehensive error handling (API failures, bad PDF, Gemini failures).
- Write professional `README.md`.

---

## Verification Plan

### Automated/Manual Verification
- **API Tests**: Postman/curl testing of all REST endpoints.
- **Unit Logic**: Testing the matching engine with mock candidate profiles and jobs to ensure the scoring formula works correctly.
- **UI Testing**: Manual verification of responsive design, routing, and error states.
- **End-to-End**: Uploading a sample resume and verifying the entire pipeline (PDF -> Gemini -> DB -> Match calculation -> UI render).
