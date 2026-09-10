<div align="center">

# Zaria Atelier — Indian Luxury Pret & Couture

> An editorial luxury fashion e-commerce platform inspired by Indian heritage, royal aesthetics, traditional craftsmanship, and contemporary design.

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript_5-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

</div>

---

## 📌 Overview

**Zaria Atelier** is a full-stack e-commerce platform designed for a modern Indian women's luxury pret and couture boutique. Built as a final-year software engineering project, it combines editorial visual design, robust core commerce logic, concurrent inventory protection, server-side validation, and a database-grounded AI shopping assistant powered by Google Gemini.

Visual design combines Indian heritage, royal interiors, vintage-inspired typography, and contemporary editorial fashion aesthetics.

---

## 🔗 Links

- **Repository**: [https://github.com/PremBorde/Boutique_ecommerce](https://github.com/PremBorde/Boutique_ecommerce)

- **Production**: [https://boutique-ecommerce-six.vercel.app/](https://boutique-ecommerce-six.vercel.app/)


---

## 📸 Interface Preview

| Homepage & Parallax Hero | Lookbook Gallery |
| :---: | :---: |
| ![Homepage Hero](./docs/screenshots/hero-opening-ritual.png) | ![Lookbook Rail](./docs/screenshots/lookbook-rail.png) |
| *Boutique storefront with smooth parallax and typography* | *Drag-to-explore horizontal lookbook rail* |

---

## ✨ Key Features

- **AI Shopping Stylist**: Interactive assistant using Google Gemini and database-connected function declarations to search products, inspect stock levels, and answer store policies directly from live data.
- **Product Search & Filtering**: Multi-facet filtering by category, size, price, and stock availability with URL query state synchronization.
- **Product Variant Matrix**: Precise management of SKU combinations across colors, sizes, and stock quantities.
- **Inventory Tracking**: Real-time variant-level stock management with database-enforced non-negative quantity constraints.
- **Shopping Cart & Coupons**: Persisted shopping cart with server-side price verification and coupon code validation rules.
- **Secure Checkout & Auth Guard**: Auth-gated checkout barrier ensuring only signed-in users can place orders, linking orders directly to verified user accounts.
- **Order Management & Cancellation**: Real-time order timeline tracking (`PENDING` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`) with cancellation support for eligible statuses.
- **Admin Dashboard**: Role-gated administration console (`/admin`) for inventory management, product archiving, and order state advancement.
- **Responsive & Editorial UI**: Modern, accessible UI featuring GSAP animations, Lenis smooth scrolling, and Framer Motion transitions with dark mode support.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, GSAP ScrollTrigger, Lenis Smooth Scroll
- **Backend & API**: Next.js Server Actions & Route Handlers, NextAuth.js (JWT authentication, bcrypt)
- **Database & ORM**: PostgreSQL, Prisma ORM
- **AI Integration**: Google Gemini 2.0 (Google Gen AI SDK with application function calling)
- **State & Utilities**: Zustand (client cart state persistence)

---

## ⚡ Engineering Highlights

- **Atomic Inventory Updates**: Concurrency-safe SQL transactions execute stock deduction only if available stock meets order quantity (`quantity >= requested_qty`).  
  *Why it matters*: Prevents overselling during high-concurrency checkout traffic.
- **Database Non-Negative Inventory Constraint**: Database-level `CHECK (quantity >= 0)` constraint enforced directly on PostgreSQL inventory tables.  
  *Why it matters*: Guarantees data integrity even if application-level checks fail or are bypassed.
- **Server-Side Price & Coupon Validation**: Product prices, active coupon discounts, and shipping tiers are recalculated on the server during checkout.  
  *Why it matters*: Prevents client-side price tampering or invalid discount manipulation.
- **Immutable Price Snapshots**: `OrderItem` records store the exact purchase price and item metadata at the moment of checkout.  
  *Why it matters*: Preserves historical sales records accurately regardless of future price changes or product updates.
- **Controlled Order State Machine**: Strict state transitions (`PENDING` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`).  
  *Why it matters*: Prevents illegal state jumps (e.g. cancelling a shipped item) and ensures predictable order lifecycles.
- **Automated Stock Restoration**: Cancelling an eligible order (`PENDING` or `CONFIRMED`) automatically restores reserved variant quantities in an atomic transaction.  
  *Why it matters*: Keeps inventory accurate without requiring manual admin intervention.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client / UI Layer"]
        Storefront["Storefront & Catalogue"]
        Cart["Cart & Checkout UI"]
        AIChat["AI Stylist Widget"]
    end

    subgraph Server ["Next.js Server / API"]
        AppRouter["Route Handlers & NextAuth"]
    end

    subgraph Database ["Persistence Layer"]
        Prisma["Prisma ORM"]
        Postgres[("PostgreSQL Database")]
    end

    subgraph AI ["AI System"]
        Gemini["Google Gemini API"]
        Tools["Database Tools\n(search, stock, info)"]
    end

    Storefront --> AppRouter
    Cart --> AppRouter
    AIChat --> AppRouter
    AppRouter --> Prisma
    Prisma --> Postgres

    AIChat --> Gemini
    Gemini --> Tools
    Tools --> Prisma
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 22+
- PostgreSQL database
- pnpm (`npm i -g pnpm`)

### Installation & Execution

```bash
# 1. Clone repository
git clone https://github.com/PremBorde/Boutique_ecommerce.git
cd Boutique_ecommerce

# 2. Install dependencies
pnpm install

# 3. Create .env file with environment variables
```

Example `.env` configuration:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/zaria_boutique?schema=public"
NEXTAUTH_SECRET="your-random-secret"
NEXTAUTH_URL="http://localhost:3000"
GEMINI_API_KEY="your-gemini-api-key"
```

```bash
# 4. Synchronize database schema & seed initial catalogue
pnpm db:push
pnpm db:seed

# 5. Launch development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Credentials

*Hardcoded test credentials for development and testing:*

| Role | Email | Password |
| :--- | :--- | :--- |
| **Customer** | `ananya@luxury.com` | `Customer@1234` |
| **Admin** | `admin@zaria.com` | `Admin@1234` |

---

## 🧪 Testing & Verification

Automated integration test scripts check edge-case integrity and system invariants:

```bash
# Verify race-condition protection, CHECK constraints, and state transitions
pnpm tsx scripts/verify_edge_cases.ts

# Verify AI assistant guardrails and tool functions
pnpm tsx scripts/verify_ai_guardrails.ts
```

| Verification Test | Target Invariant | Result |
| :--- | :--- | :---: |
| **Inventory Concurrency** | Prevents overselling when processing concurrent checkouts | **PASSED** |
| **Database CHECK Constraint** | Rejects negative stock values at the database layer | **PASSED** |
| **Order State Transitions** | Restricts invalid or terminal order state changes | **PASSED** |
| **Coupon Validation** | Validates coupon thresholds, expiration, and server-side pricing | **PASSED** |
| **AI Guardrails** | Verifies database tool grounding for stock and product data | **PASSED** |

---

## 🔮 Future Improvements

- **Virtual Fitting Room**: 3D garment visualization using measurement-based mesh rendering.
- **Automated Delivery Notifications**: Integration with SMS and WhatsApp webhooks for real-time dispatch and delivery updates.
- **Distributed Inventory Locking**: Redis-backed distributed locks (Redlock) for multi-region scalability.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

## 👤 Author

**Prem Borde**  
- **GitHub**: [@PremBorde](https://github.com/PremBorde)  
- **Repository**: [Boutique_ecommerce](https://github.com/PremBorde/Boutique_ecommerce)

