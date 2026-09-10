# Zaria Atelier — Production Deployment & Operations Guide

> A step-by-step operational guide for deploying Zaria Atelier to production on **Vercel** with a managed **PostgreSQL** database (e.g. Supabase, Neon, Railway, or AWS RDS).

---

## 1. Prerequisites

Before launching to production, ensure you have:
1. A **GitHub** repository containing this codebase (e.g. `https://github.com/PremBorde/Boutique_ecommerce`).
2. A managed **PostgreSQL** database URL (PostgreSQL 14+ recommended).
3. A **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/).
4. A **Vercel** account (or equivalent host supporting Next.js 14 App Router).

---

## 2. Environment Variables Matrix

Configure the following variables in your production environment settings (Vercel Project Settings → Environment Variables):

| Variable Name | Required | Description | Example / Recommendation |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | Pooled PostgreSQL connection string | `postgresql://user:pass@ep-cool-db.us-east-2.aws.neon.tech/zaria?sslmode=require` |
| `NEXTAUTH_URL` | **Yes** | Canonical production URL | `https://zaria-atelier.vercel.app` (or your custom domain) |
| `NEXTAUTH_SECRET` | **Yes** | 32+ character entropy string for JWT encryption | Generate via `openssl rand -base64 32` |
| `GEMINI_API_KEY` | Optional | Google Gemini 2.0 API key for AI Concierge | Required for live AI shopping assistant queries |

> [!IMPORTANT]
> When using serverless PostgreSQL providers (like Neon or Supabase with connection pooling), make sure your `DATABASE_URL` uses transaction mode pooling or append `?pgbouncer=true` if using Prisma with PgBouncer.

---

## 3. Step-by-Step Vercel Deployment

### Step 3.1: Connect GitHub Repository
1. Navigate to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New... → Project**.
2. Select the `Boutique_ecommerce` repository from your GitHub account.
3. Framework Preset will auto-detect as **Next.js**.
4. Root Directory: `./` (or leave default).

### Step 3.2: Configure Build & Development Settings
- **Build Command**: `prisma generate && next build` (or leave default, as `package.json` includes `prisma generate; next build`).
- **Install Command**: `pnpm install`

### Step 3.3: Add Environment Variables
Insert `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and `GEMINI_API_KEY` as defined in Section 2.

### Step 3.4: Deploy
Click **Deploy**. Vercel will compile the Next.js App Router bundle, generate Prisma Client artifacts, and provision the serverless edge lambdas.

---

## 4. Production Database Migration & Seeding

Once your database is linked, apply the schema and seed the initial luxury catalog:

### Option A: From your local development machine (Recommended)
Set your `.env` temporarily to point to the production database and run:
```bash
# Push schema definitions & check constraints
pnpm prisma db push

# Populate 17 couture items, users, and coupons
pnpm db:seed
```

### Option B: Using Vercel CLI
```bash
npx vercel env pull .env.production.local
npx prisma db push
pnpm tsx prisma/seed.ts
```

---

## 5. Post-Deployment Verification Checklist

- [ ] **Homepage & Heritage Ticker**: Visit the root domain; ensure editorial hero, craft pillars, and intro animations render fluidly.
- [ ] **Nocturne Dark Mode**: Toggle between Ivory and Nocturne Dark Mode in the navbar; refresh the page to confirm zero flash of unstyled content (anti-FOUC).
- [ ] **Navbar Active Underlines**:
  - Click **All Creations** (`/shop`) → Underline appears under "ALL CREATIONS".
  - Click **Lehengas** (`/shop?category=lehengas-couture`) → Underline shifts to "LEHENGAS".
  - Click **Sarees**, **Festive Pret**, and **Contemporary** → Underline accurately reflects the selected vault section.
- [ ] **Catalogue Facets**: In `/shop`, verify that category tabs filter products and update the URL synchronously.
- [ ] **Bag & Cart Drawer**: Add items to the curated bag; verify live count badge and drawer slide-in without hydration errors.
- [ ] **Checkout Simulation**: Use privilege coupon `ROYAL15` or `FESTIVE25` and complete an order to verify atomic inventory decrement.
- [ ] **Zaria AI Concierge**: Click the floating gold medallion in the bottom-right and ask for recommendations (e.g. *"Show me your crimson bridal lehengas"*).
- [ ] **Admin Portal**: Sign in with `admin@zaria.com` / `Admin@1234` and verify order status management at `/admin`.

---

## 6. Seeded Demo Accounts & Credentials

For production evaluators and client demonstrations, the database includes pre-configured access credentials:

### Master Artisan (Administrator)
- **URL**: `/admin`
- **Email**: `admin@zaria.com`
- **Password**: `Admin@1234`
- **Permissions**: Full vault inventory management, order state machine progression, order cancellation.

### Royal Client (Customer)
- **URL**: `/account`
- **Email**: `ananya@luxury.com`
- **Password**: `Customer@1234`
- **History**: Pre-seeded with order `ZR-2026-8819`.

### Valid Privilege Coupons
- `ROYAL15`: 15% off (Min order ₹4,999, max discount ₹2,500)
- `FESTIVE25`: 25% off (Min order ₹12,000, max discount ₹5,000)
- `ATELIER10`: 10% off (Min order ₹2,999)
- `EXPIRED20`: Expired test code (validates server rejection)

---

## 7. Troubleshooting & Common Pitfalls

### Issue: Hydration Warning on Cart Badge
- **Cause**: Reading client-side storage before DOM mount.
- **Remedy**: Ensure `mounted` guard (`useState(false)` + `useEffect`) wraps any `itemCount > 0` badge rendering in the navbar or layout.

### Issue: Gemini API 429 Quota Exceeded
- **Cause**: Google AI Studio free tier rate limits (15 RPM).
- **Remedy**: The built-in heuristic fallback in `/api/chat` automatically responds with real database matches if Gemini hits rate limit quotas.

### Issue: PostgreSQL Connection Limit Reached
- **Cause**: Too many serverless lambda instances connecting simultaneously.
- **Remedy**: Ensure `DATABASE_URL` utilizes connection pooling (e.g. Supabase port 6543 or Neon's `-pooler` endpoint).
