# GenAI Assessment

Simple full‑stack LLM parameter lab: a Next.js 16 frontend to experiment with parameters and visualize metrics, and an Express/TypeScript backend that calls Gemini, computes metrics, and persists runs in MongoDB.

## Quick Start

1. Prereqs: Node 18+, npm, a Google Gemini API key, and (for persistence) a MongoDB Atlas URI.
2. Backend
   - Env: create `backend/.env` with at least:
     - `PORT=4000`
     - `GEMINI_API_KEY=...`
     - `MONGO_URI=...` (required to save/list/delete labs)
     - `CORS_ORIGIN=https://your-frontend-domain.com` (comma‑separated list)
     - Optional: `FRONTEND_URL=https://your-frontend-domain.com`, `CORS_ALLOW_ALL=false`
   - Run: `cd backend && npm install && npm run dev`
3. Frontend
   - Env: create `frontend/.env.local`:
     - `BACKEND_URL=http://localhost:4000` (or your deployed API URL)
   - Run: `cd frontend && npm install && npm run dev` then open http://localhost:3000

## Setup & Scripts

- Frontend (Next.js 16)
  - `npm run dev` | `npm run build` | `npm start`
- Backend (Express + TS)
  - `npm run dev` (nodemon/ts-node) | `npm run build` | `npm start`

## Architecture

- Frontend (App Router): UI to input prompt and N parameter sets, triggers generation via `POST /api/v1/llm/generate`, shows results/metrics, and offers a Save action.
- Backend: Express API with modules for LLM (Gemini with retry/timeout), metrics (readability, TTR, sentiment), labs (generate+persist, save, list, get, delete), and Mongo integration.
- Persistence: MongoDB collection `labs`; saving is explicit via `POST /api/v1/labs`.

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS v4, Radix UI patterns, lucide icons.
- Backend: Node/Express 5, TypeScript, Zod validation, MongoDB Node driver, `@google/generative-ai`.

## Parameters ↔ Metrics (how to interpret)

- Generation parameters
  - Temperature: randomness. Higher → more varied wording; may reduce coherence/readability and swing sentiment.
  - Top P (nucleus): include tokens until cumulative probability ≥ p. Higher p → more tail tokens → diversity up; too high can hurt clarity.
  - Top K: sample from top‑K probable tokens. Small K → stable/repetitive; larger K → more variety (similar effect to higher Top P).
  - Max Output Tokens: upper bound on length. Higher → allows longer answers; mainly drives Word Count.

- Metrics in this app
  - Vocabulary Diversity (TTR): higher means more unique words; usually increases with higher Temperature/Top P/Top K.
  - Readability (Flesch): higher is easier to read; tends to drop with very long outputs or very high randomness.
  - Word Count: generally increases with Max Output Tokens and sometimes with higher randomness.
  - Sentiment (AFINN): >0 positive, <0 negative; higher randomness can add variance, but tone is best controlled via the prompt.

- Practical heuristics
  - Want richer phrasing? Slightly raise Temperature or Top P/Top K and keep Max Tokens moderate.
  - Want concise, clear answers? Lower Temperature and Top P/Top K; cap Max Tokens.
  - Need steady tone? Keep Temperature lower and enforce tone in the prompt.

## Deployment (overview)

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
