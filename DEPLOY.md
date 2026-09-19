# Deploy Let Her Speak (free tiers)

## Architecture

```
Browser → Vercel (React SPA)
              ↓  HTTPS + CORS
         Render (FastAPI)
              ↓
         Neon (Postgres)
```

## 1. Database (Neon)

1. Create a free project at [neon.tech](https://neon.tech)
2. Copy the connection string (use the pooled URL if offered)
3. Example:

```env
DATABASE_URL=postgresql+psycopg2://USER:PASSWORD@HOST/DB?sslmode=require
```

## 2. API (Render)

1. Push this repo to GitHub
2. New **Web Service** on [render.com](https://render.com)
3. Root directory: `backend`
4. Runtime: Docker (uses `backend/Dockerfile`) **or** native:
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Environment variables:

| Key | Value |
|---|---|
| `DATABASE_URL` | Neon URL (`postgresql+psycopg2://...`) |
| `CORS_ORIGINS` | `https://YOUR-FRONTEND.vercel.app` |
| `MODERATION_SECRET` | long random string |
| `SEED_ON_STARTUP` | `true` (first boot), then optionally `false` |
| `FRONTEND_BASE_URL` | `https://YOUR-FRONTEND.vercel.app` |
| `ADMIN_EMAIL` | your inbox for report alerts (optional) |
| `SMTP_HOST` | e.g. `smtp.gmail.com` or Resend/SendGrid SMTP |
| `SMTP_PORT` | `587` |
| `SMTP_USER` / `SMTP_PASSWORD` | SMTP credentials |
| `SMTP_FROM` | verified sender address |

6. After deploy, open `https://YOUR-API.onrender.com/docs` and `/api/health`

## 3. Frontend (Vercel)

1. Import the repo in [vercel.com](https://vercel.com)
2. Root directory: `frontend`
3. Framework preset: Vite
4. Environment variable:

| Key | Value |
|---|---|
| `VITE_API_BASE` | `https://YOUR-API.onrender.com` (no trailing slash) |

5. Deploy — SPA rewrites are in `frontend/vercel.json`

## 4. Smoke test

- Home loads seeded stories
- Create a story → lands on detail page
- Toggle reactions, add a comment
- Report the same story 3 times from different browsers/profiles → auto-hide
- `/api/health` returns `database: up`

## Optional: local Postgres

```bash
docker run --name lhs-pg -e POSTGRES_PASSWORD=lhs -e POSTGRES_DB=letherspeak -p 5432:5432 -d postgres:16-alpine
```

Then set:

```env
DATABASE_URL=postgresql+psycopg2://postgres:lhs@localhost:5432/letherspeak
```

## Report email alerts (optional)

When `ADMIN_EMAIL` and SMTP settings are configured, the API sends the admin an email on each **new** report (via background task — the user doesn't wait for email delivery).

Free options: Gmail app password, [Resend](https://resend.com), [SendGrid](https://sendgrid.com), or [Brevo](https://www.brevo.com). Leave `ADMIN_EMAIL` empty in dev if you don't need alerts.

## Cost

All three services have free tiers suitable for a portfolio demo. Cold starts on Render free web services are normal — mention that in interviews as a tradeoff you accepted for cost.
