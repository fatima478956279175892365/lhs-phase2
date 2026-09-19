# Let Her Speak

Anonymous community platform where women share stories of resilience, injustice, gender bias, triumphs, and daily struggles — rebuilt as a **production-shaped full-stack portfolio piece**.

**Concept live (earlier MVP):** [letherspeak.vercel.app](https://letherspeak.vercel.app/)

## Why this stack (interview-ready)

| Layer | Choice | Why it’s defendable |
|---|---|---|
| API | **FastAPI** + Pydantic | Auto OpenAPI docs, typed contracts, async-ready Python standard for APIs |
| ORM | **SQLAlchemy 2** | Explicit models/queries; easy to explain vs “magic” frameworks |
| DB | **SQLite local / Postgres (Neon) prod** | Zero-friction local; free managed Postgres for deploy |
| UI | **React + Vite + Tailwind** | Industry-default SPA skills; clear API boundary |
| Hosting | **Render (API) + Vercel (UI) + Neon (DB)** | All have free tiers; mirrors real split front/back deploys |

This is not “Python templates only” on purpose: remote evidence-based hiring wants to see an end-to-end product with a real API surface you can demo at `/docs`.

## Product features (beyond a basic CRUD feed)

- Shareable **story detail pages**
- **Search**, category filters, sort (newest/featured, most supported, most discussed)
- Pagination (“load more”)
- Dual reactions: **Stand with her** + **This helped**
- Comments with seeded discussion
- **Report → auto-hide** after threshold (moderation thinking)
- Secret-header **moderation endpoint**
- Sliding-window **rate limiting** on writes
- Visitor identity via cookie + `X-Visitor-Id` (works cross-origin)
- Live **`/api/health`** wired into the UI status pill
- **Safety resources** page + community guidelines
- Rich **seed data** (15 stories, replies, reactions)

## Project layout

```
backend/     FastAPI application
frontend/    React (Vite) SPA
```

## Local setup

### 1. API

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # or: cp .env.example .env
uvicorn app.main:app --reload --port 8001
```

- API: http://127.0.0.1:8001  
- Docs: http://127.0.0.1:8001/docs  
- Health: http://127.0.0.1:8001/api/health  

Seed runs automatically on first startup when the DB is empty.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — Vite proxies `/api` to the FastAPI server.

## Deploy (free)

See **[DEPLOY.md](./DEPLOY.md)**.

## Talking points for interviews

1. **Evidence over résumé:** ship a usable product with moderation, safety, and rate limits — not only happy-path CRUD.
2. **Contract-first API:** Pydantic schemas + OpenAPI; frontend consumes a stable `/api` surface.
3. **Abuse & trust:** anonymous visitors, unique reports per visitor, auto-hide threshold, moderation secret.
4. **Deploy realism:** separate SPA and API, CORS + visitor header strategy, health checks.
5. **Product taste:** distinctive visual system, story deep-links, dual social signals, safety page.
