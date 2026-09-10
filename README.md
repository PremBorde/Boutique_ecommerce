# Zaria Atelier — Indian Luxury Pret & Couture

> *"Threaded in Gold, Cut in Silk"*  
> An editorial e-commerce experience celebrating generational weaving guilds, royal baroque minimalism, and high-fashion craft. Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **PostgreSQL**, **Google Gemini 2.0 Flash function calling**, **GSAP ScrollTrigger**, and **Lenis Smooth Scroll**.

📚 **Project Documentation Guides**:
- 🏛️ **[ARCHITECTURE.md](file:///d:/Internship%20Challege/Boutique_ecommerce/ARCHITECTURE.md)**: In-depth technical architecture, concurrency models, state machine transitions, and hydration patterns.
- 🚀 **[DEPLOYMENT.md](file:///d:/Internship%20Challege/Boutique_ecommerce/DEPLOYMENT.md)**: Production deployment instructions for Vercel, PostgreSQL/Supabase configuration, environment variables, and verification checklists.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer (Next.js 14 App Router)"]
        UI["Editorial Storefront / Catalogue"]
        PDP["Product Detail (Variant Matrix & Image Crossfade)"]
        CartStore["Zustand Cart Store (Local Persist + Live Sync)"]
        ChatUI["Floating AI Stylist Widget (Framer Motion)"]
        GSAPLayer["Lenis + GSAP ScrollTrigger Animation Engine"]
    end

    subgraph API ["Server Layer (Next.js Route Handlers)"]
        AuthRoute["/api/auth (NextAuth JWT + bcrypt)"]
        ProductsRoute["/api/products (Multi-Facet Filter & Search)"]
        CartValRoute["/api/cart/validate (Price & Stock Check)"]
        CouponRoute["/api/coupon/validate (Rules & Thresholds)"]
        CheckoutRoute["/api/checkout (Atomic Conditional Decrement)"]
        OrdersRoute["/api/orders/[id]/cancel (State Machine Rollback)"]
        AdminRoutes["/api/admin/* (Role-Gated Dashboard APIs)"]
        ChatRoute["/api/chat (Gemini 2.0 Flash Tool Loop)"]
    end

    subgraph Database ["Persistence Layer (PostgreSQL + Prisma)"]
        Prisma["Prisma ORM Client"]
        Tables[("PostgreSQL\nUser | Product | Variant\nInventory (CHECK >= 0)\nOrder | OrderItem\nCoupon | ChatSession")]
    end

    subgraph AI ["AI Shopping Assistant (Google Gemini)"]
        Gemini["Gemini 2.0 Flash Engine"]
        Tools["Function Declarations:\nsearchProducts()\ngetProductById()\ncheckStock()\ngetStoreInfo()"]
    end

    UI --> ProductsRoute
    PDP --> CartStore
    CartStore --> CartValRoute
    CartStore --> CheckoutRoute
    ChatUI --> ChatRoute
    
    ChatRoute <--> Gemini
    Gemini <--> Tools
    Tools <--> Prisma

    CheckoutRoute --> Prisma
    AdminRoutes --> Prisma
    ProductsRoute --> Prisma
    AuthRoute --> Prisma
    Prisma --> Tables
```

---

## 💎 Core Capabilities

### 1. AI Shopping Assistant — Architecture & Guardrails (The Centerpiece)

- **Model Engine**: `gemini-2.0-flash` (with one-line swap configuration in `src/lib/ai/config.ts` to `gemini-1.5-flash`).
- **Zero-Hallucination Grounding**: Four real Prisma-backed grounding query functions in `src/lib/ai/tools.ts`:
  - `searchProducts({ query, category, maxPrice, minPrice, color, size, inStockOnly })`: Sanitizes and trims DB rows (omitting admin cost prices or internal notes), caps results to 8.
  - `getProductById({ id })`: Fetches precision garment details and live variants.
  - `checkStock({ variantId, productId, color, size })`: Checks live vault inventory.
  - `getStoreInfo({ topic })`: Canonical hand-written store policies (`returns`, `shipping`, `cod`, `craftsmanship`).
  - `getCraftStory({ productId })`: Returns authentic craft heritage facts without LLM improvisations.
- **Server Function-Calling Route (`/api/ai/chat`)**:
  - Deterministic loop capped at 5 iterations.
  - **Grounding ID Bookkeeping**: Product IDs in the structured `{ message, products: string[] }` response are derived exclusively from actual verified tool execution results (`touchedProductIds`), preventing model-invented IDs.
  - Rate limiting & graceful degradation: Returns 200 with polite "taking a breath" message on 429 rather than broken UI.
  - Server-Only Security: `GEMINI_API_KEY` and `@google/generative-ai` are strictly absent from all client bundles.
- **Polished Chat UI (`ChatPanel.tsx` / `AiChatWidget.tsx`)**:
  - Sliding drawer on desktop / bottom sheet on mobile with idle pulse.
  - Renders the **existing storefront `<ProductCard />`** inline directly within the chat stream.
  - Dynamic festival prompt chips (e.g. Navratri, Diwali) and style persona badges.
- **Ambient Roaming Companion**:
  - Hovering any product card displays `product.stylistNote` with **zero extra network requests**.
  - Escalation button seamlessly launches Concierge prefilled with the garment inquiry.
- **Creative Enhancements**:
  - **8.1 Craft Storytelling**: Answers heritage questions from verified `story` & `fabric` columns.
  - **8.2 Style Twin Persona**: Deterministic scoring (e.g. "👑 The Modern Maharani") based on session signals.
  - **8.3 Complementary Nudges**: Curated pairing strips on cart drawer and chat recommendations.
  - **8.4 Festival Windows**: Calendar-aware suggested prompt chips (Navratri, Karva Chauth, Diwali).
  - **8.5 Honest "No Match" Logging**: Zero-match searches log to `UnmetSearchRequest` for merchant intelligence.
  - **8.6 "Won't Oversell" Trait**: Recommends comparable lower-priced in-stock items when asked about price.

#### AI Guardrails & Grounding Verification Script Results

Automated test suite (`scripts/verify_ai_guardrails.ts`) verified against live PostgreSQL:

| Test Scenario | Query / Input | Expected Guardrail Behavior | Result |
|---|---|---|:---:|
| **Zero Matches** | "black western mini dress polyester under ₹2,500" | Returns `[]` empty array; states no matches; logs to `UnmetSearchRequest`; never invents items. | **PASSED** |
| **Missing Variant** | Query "XXXL" size on silk saree | Returns unavailable; reports real available sizes/colors; never assumes stock. | **PASSED** |
| **Price Accuracy** | Price check on any garment | Reflects exact database `basePrice`; never hallucinates pricing. | **PASSED** |
| **Return Policy** | "What is your return & exchange policy?" | Answers strictly from `STORE_INFO.returns` (7-day window, hallmark intact). | **PASSED** |
| **Payment / COD** | "Can I pay with COD / cash on delivery?" | Answers strictly from `STORE_INFO.cod` (No COD for insured pure silk couture). | **PASSED** |
| **Shipping Rules** | "What are your shipping rates and dispatch time?" | Answers strictly from `STORE_INFO.shipping` (Free above ₹10,000, 2–4 day dispatch). | **PASSED** |
| **Craft Heritage (8.1)** | "What's the craft story of this piece?" | Retrieves DB `story`/`fabric`; states if unavailable; never invents cultural history. | **PASSED** |
| **Style Twin (8.2)** | 2+ luxury silk & bridal queries | Classifies "The Modern Maharani" via tag overlap scoring without live AI calls. | **PASSED** |
| **Pairings (8.3)** | Complementary category lookup | Returns curated pairing categories (Saree → Festive Pret / Anarkalis). | **PASSED** |
| **Festival Windows (8.4)** | Date check for September–November | Detects active festival window (Navratri / Karva Chauth / Diwali) via calendar config. | **PASSED** |
| **Unmet Search Log (8.5)** | Zero-match customer search | Successfully writes row to `UnmetSearchRequest` for admin dashboard review. | **PASSED** |
| **Rate Limit Resilience** | Rapid-fire client messages | Gracefully throttles without breaking React state or showing raw stack traces. | **PASSED** |

### 2. Core Commerce & Race-Condition Safety (15% Weight)
- **Variant/SKU Matrix**: Every color-size combination is its own row with unique SKU (`ZR-NML-CRM-M`) and independent 1:1 `Inventory` record.
- **Atomic Conditional Decrement**:
  ```sql
  UPDATE "Inventory" 
  SET quantity = quantity - :qty 
  WHERE "variantId" = :id AND quantity >= :qty;
  ```
  Wrapped inside a single Prisma `$transaction`. If `rowCount !== 1`, the order immediately aborts with `INSUFFICIENT_STOCK`, preventing overselling without table locks.
- **PostgreSQL Database Constraint**:
  ```sql
  ALTER TABLE "Inventory" ADD CONSTRAINT check_inventory_non_negative CHECK (quantity >= 0);
  ```
  Enforces non-negative inventory at the database kernel level.
- **Server-Side Validation**: Never trusts client totals. Recalculates subtotal, active coupon status, and shipping on the fly during checkout.
- **Historical Order Price Snapshot**: `OrderItem` stores unit price at purchase time, never joining live product prices.

### 3. Order Status State Machine
- Strict lifecycle rules:
  $$\text{PENDING} \longrightarrow \text{CONFIRMED} \longrightarrow \text{PROCESSING} \longrightarrow \text{SHIPPED} \longrightarrow \text{DELIVERED}$$
- $\text{CANCELLED}$ is reachable **only** from $\text{PENDING}$ or $\text{CONFIRMED}$.
- Cancelling an order atomically increments inventory back into the vault.
- Terminal states ($\text{DELIVERED}$, $\text{CANCELLED}$) lock further transitions.

```mermaid
stateDiagram-v2
    [*] --> PENDING: Client Places Order
    PENDING --> CONFIRMED: Payment Verified
    PENDING --> CANCELLED: Client / Admin Cancel (Stock Restored)
    CONFIRMED --> PROCESSING: Atelier Tailoring
    CONFIRMED --> CANCELLED: Order Retracted (Stock Restored)
    PROCESSING --> SHIPPED: White-Glove Dispatch
    SHIPPED --> DELIVERED: Client Handover (Terminal)
    CANCELLED --> [*]
    DELIVERED --> [*]
```

### 4. Signature Animations & Choreography (30% Weight)
- **Lenis + GSAP Ticker Synchronization**: Smooth scroll driven directly by `gsap.ticker` (`lagSmoothing(0)`), preventing scrollbar desync.
- **"The Atelier Opens" Opening Ritual**: On first visit (<1.8s), gold hairline SVG draws in, wordmark collapses letter-spacing from wide to royal tracking, and two oxblood panels part in a regal curtain-wipe.
- **Layered Parallax Hero**: Background ornamental mandala, midground garment cut, and foreground floating embroidery cards move at differential scrub speeds.
- **Scroll-Pinned Craft Pillars**: Sequence of 5 craft pillars pinned to viewport with crossfading macro garment photography.
- **Drag-to-Explore Lookbook Rail**: Horizontal rail with inertia momentum on mouse release.
- **Custom Morphing Cursor**: Sub-pixel `gsap.quickTo` tracking with pill hover labels (`Explore`, `Drag Rail`, `View Bag`).
- **Product Card 3D Tilt & Swatch Crossfade**: Dual-image hover crossfade with Framer Motion 3D perspective tilt.

### 5. Royal Nocturne Dark Mode & Active Nav Synchronization
- **Nocturne Mode**: One-click toggle between warm ivory parchment (`#FAF7F2`) and obsidian velvet nocturne (`#0C0A0B`) with gilded borders (`#D4AF37`).
- **Anti-FOUC Engine**: Zero flash of unstyled content via blocking inline `<head>` script reading `localStorage` before layout paint.
- **Synchronized Vault Navigation**: Nav links accurately detect active categories via `useSearchParams()` (e.g. `/shop?category=lehengas-couture` highlights **LEHENGAS** with a gold underline, while `/shop` highlights **ALL CREATIONS**). Category filter tabs on the `/shop` page dynamically sync browser URLs.

### 6. Expanded 17-Piece Heirloom Catalog
- **Diverse Categories**: Fully seeded vault spanning Lehengas & Couture (4), Heritage Sarees (4), Anarkalis & Ensembles (3), Festive Pret (3), and Regal Menswear (3).
- **Rich Specs**: Every garment features authentic Indian couture details — artisanal weave stories, fabric compositions, colorways, multi-angle photos, and SKU-level inventory tracking.

---

## 🎨 Design Tokens & Palette

| Token | Hex | Role |
| :--- | :--- | :--- |
| **Oxblood Deep** | `#210408` | Primary brand background & curtain panels |
| **Oxblood** | `#4A0E17` | Primary buttons, headers, accents |
| **Royal Emerald** | `#0B3B24` | Festive secondary jewel tone & in-stock badges |
| **Antique Gold** | `#B38F3F` | Delicate hairline borders & hallmark icons |
| **Gold Foil** | `#E6CA85` | Metallic shimmering kinetic headlines |
| **Warm Ivory** | `#FAF7F2` | Main page canvas & text contrast surface |
| **Velvet Noir** | `#141113` | Deep charcoal contrast & craft pillar background |

**Typography:**
- Display: `Cinzel` (Google Fonts)
- Headings: `Playfair Display` (Google Fonts)
- Body: `Plus Jakarta Sans` (Google Fonts)

---

## 🧪 Evaluator Quickstart & Demo Credentials

### 1. Instant Test Logins
Visit `/account` or click the **Client Account** icon in the navbar:

| Role | Email | Password | Quick Action |
| :--- | :--- | :--- | :--- |
| **Customer** | `ananya@luxury.com` | `Customer@1234` | Click *"Fill Customer"* button |
| **Master Artisan (Admin)** | `admin@zaria.com` | `Admin@1234` | Click *"Fill Admin"* button |

### 2. Live Demo Feature Tour
- **Storefront (`/`)**: Scroll to experience the opening ritual, parallax hero, drag lookbook rail, and scroll-pinned craft pillars.
- **Catalogue (`/shop`)**: Filter by Lehengas, Sarees, Pret; filter by size or "In Stock Only"; sort by price.
- **PDP (`/product/[slug]`)**: Select color swatches to trigger soft image crossfades. Notice that out-of-stock combinations (e.g. *Noor Mahal Lehenga in Emerald, Size M*) are clearly marked with real-time stock badges.
- **Cart (`/cart`)**: Test coupon codes:
  - `ROYAL15` — 15% off orders over ₹4,999 (Valid)
  - `FESTIVE25` — 25% off orders over ₹12,000 (Valid)
  - `EXPIRED20` — Expired coupon (Demonstrates server rejection)
- **Checkout (`/checkout`)**: Click *"Auto-Fill Address"*. Toggle between **"Simulate Payment Success"** and **"Simulate Payment Failure"** to test payment decline behavior without touching inventory.
- **Order Timeline (`/orders/[id]`)**: View real-time state machine progression. Click *"Cancel Order"* to watch stock atomically restore to the database.
- **Admin Console (`/admin`)**: Edit variant stock live with instant saves; archive/activate pieces.
- **Admin Orders (`/admin/orders`)**: Advance orders through allowed state machine stages; verify invalid transitions are rejected.
- **AI Stylist (Floating Widget)**: Click bottom-right button or suggested chips to search the vault, verify stock, or ask for store policies.

---

## 🚀 Setup & Local Execution

### Prerequisites
- Node.js 18+ or 22+
- PostgreSQL database (or local PostgreSQL on port 5432)
- pnpm (`npm i -g pnpm`)

### Installation
```bash
# 1. Clone repository
git clone https://github.com/PremBorde/Boutique_ecommerce.git
cd Boutique_ecommerce

# 2. Install dependencies
pnpm install

# 3. Configure environment variables
# Copy .env.example or create .env:
DATABASE_URL="postgresql://postgres:root@localhost:5432/zaria_boutique?schema=public"
NEXTAUTH_SECRET="zaria-super-secret-luxury-pret-key-2026"
NEXTAUTH_URL="http://localhost:3000"
GEMINI_API_KEY="your-gemini-api-key-from-aistudio"

# 4. Synchronize database schema & seed luxury catalogue
pnpm db:push
pnpm db:seed

# 5. Launch development server
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Automated Edge Case Verification

Run the built-in integrity test suite to verify race conditions, check constraints, and state machines:

```bash
pnpm tsx scripts/verify_edge_cases.ts
```

**Test Output:**
```
==================================================
  ZARIA ATELIER — EDGE CASES & INTEGRITY TEST SUITE 
==================================================

[Test 1] State Machine Transition Rules:
  ✓ PASS: State machine correctly permits valid transitions and rejects invalid/terminal transitions.

[Test 2] PostgreSQL Database CHECK Constraint (quantity >= 0):
  ✓ PASS: Database rejected negative stock with check_inventory_non_negative constraint violation.

[Test 3] Simulated Race-Condition Protection (Two concurrent checkouts for 1 unit of stock):
  ✓ PASS: Exactly 1 order succeeded and 1 failed with INSUFFICIENT_STOCK. Zero over-selling!

[Test 4] Expired Coupon Validation:
  ✓ PASS: Expired coupon 'EXPIRED20' has past timestamp and will be rejected at checkout.

==================================================
  VERIFICATION RESULTS: 4 PASSED, 0 FAILED
==================================================
```

---

## 🔍 Self-Awareness: Known Limitations & "If I Had More Time"

### Known Limitations
1. **Gemini Free-Tier Rate Limits**: Google AI Studio free tier limits requests to 15 RPM. A client-side debouncer and heuristic fallback ensure the interface never crashes during rapid typing.
2. **Local Image Assets**: Products use Unsplash editorial photography rather than studio photoshoot assets.
3. **Simulated Payment Gateway**: Real payments are simulated via success/failure toggles rather than live Razorpay/Stripe webhooks.

### If I Had More Time
1. **Redis Distributed Locks (Upstash)**: Add Redlock distributed locks alongside atomic conditional updates for multi-region clustering.
2. **Virtual Fitting Room (3D Canvas)**: Integrate a Three.js fabric simulation shader to drape silks over a 3D mannequin based on customer waist and height inputs.
3. **Automated WhatsApp / SMS Dispatch Notifications**: Wire Twilio webhooks to dispatch royal SMS updates as the order advances from $\text{PROCESSING} \to \text{SHIPPED}$.

---

## 📜 Git Commit Hygiene

The codebase was constructed with incremental, production-grade commits:
- `chore: init next.js + tooling`
- `feat: design tokens + typography`
- `feat: prisma schema + db setup`
- `feat: auth`
- `feat: product catalogue + variant system`
- `feat: cart + checkout + atomic inventory locking`
- `feat: order status state machine + admin dashboard`
- `feat: AI assistant backend (tools) + UI`
- `feat: scroll animations (lenis+gsap) + signature interactions`
- `fix/polish: suspense boundaries + edge cases test suite`
- `docs: README + architecture notes`

---

*Handcrafted with devotional precision for the Full Stack Developer Internship Challenge.*
