# Light Textiles — Developer Handbook

A complete technical reference for the Light Textiles storefront + admin panel. Written for a senior developer who needs to confidently maintain, extend, and scale this codebase without prior exposure to it.

> **Scope note on roles:** the codebase's actual `AdminRole` enum is `OWNER / MANAGER / WAREHOUSE / EMPLOYEE`. There is no "ADMIN" or "STAFF" role anywhere in the schema or code — this document uses the real names throughout. See [§6 Authentication & Authorization](#6-authentication--authorization).

---

## Table of Contents

1. [Architecture overview](#1-architecture-overview)
2. [Project structure](#2-project-structure)
3. [Frontend](#3-frontend)
4. [Backend](#4-backend)
5. [Database](#5-database)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Admin panel](#7-admin-panel)
8. [Public website](#8-public-website)
9. [Deployment](#9-deployment)
10. [Environment variables](#10-environment-variables)
11. [Dependencies](#11-dependencies)
12. [Render specifics](#12-render-specifics)
13. [Custom domain](#13-custom-domain)
14. [Project workflows](#14-project-workflows)
15. [Security audit](#15-security-audit)
16. [Performance audit](#16-performance-audit)
17. [Quick-reference cheat sheet](#17-quick-reference-cheat-sheet)

---

## 1. Architecture overview

Light Textiles is a single Next.js 15 (App Router) application that serves **both** the public storefront and the `/admin` back office from one codebase and one deployment. There is no separate backend service — "the API" is Next.js Route Handlers (`src/app/api/**`) and React Server Actions (`actions.ts` files), both running inside the same Node process as the pages.

```mermaid
flowchart TB
    subgraph Client["Browser"]
        RSC["Server Components (SSR HTML)"]
        CC["Client Components (React, hydrated)"]
    end

    subgraph NextServer["Next.js server (single Node process on Render)"]
        Pages["App Router pages\nsrc/app/[locale]/**, src/app/admin/**"]
        MW["middleware.ts\n(i18n routing + admin auth gate)"]
        API["Route Handlers\nsrc/app/api/**"]
        Actions["Server Actions\nsrc/app/admin/**/actions.ts"]
        Lib["lib/ — data access & business logic\n(products, orders, categories, notifications, rbac, session)"]
    end

    subgraph DataLayer["Data layer"]
        Prisma["Prisma Client\n(src/lib/prisma.ts, singleton)"]
        PG[("PostgreSQL\nvia DATABASE_URL")]
        FS[("Local filesystem\npublic/uploads/**")]
    end

    Client -->|HTTP request| MW
    MW --> Pages
    CC -->|fetch| API
    Pages -->|direct import, no HTTP hop| Lib
    Pages -->|form submit / mutation| Actions
    API --> Lib
    Actions --> Lib
    Lib --> Prisma
    Prisma --> PG
    Actions -->|file upload| FS
    API -->|file upload| FS
```

**How each layer talks to the next:**

- **Browser → Next.js server.** Every request first passes through `src/middleware.ts`. For `/admin/**` paths it enforces authentication/role checks (see §6). For everything else it delegates to `next-intl`'s middleware, which resolves the `[locale]` segment and sets the locale cookie.
- **Server Components → `lib/`.** Public pages and admin pages are React Server Components. They call functions in `src/lib/*.ts` (e.g. `getProductBySlug`, `getCategoryTree`) **directly, in-process** — this is not an HTTP call, just a function call that happens to `await prisma.*`. This is the dominant data-fetching pattern on this site.
- **Client Components → `/api/**`.** A handful of interactive, client-side pieces (favorites page, quick-order modal, checkout form, admin notification bell, admin media uploader) can't call `lib/` directly because they run in the browser, so they `fetch()` a Route Handler under `src/app/api/**`, which in turn calls `lib/`.
- **Admin mutations → Server Actions.** Every admin write (create/update/delete/toggle) is a `"use server"` function exported from an `actions.ts` file colocated with its page, invoked directly from a form's `action` prop or from a client component via a normal async function call. Next.js handles the RPC transport transparently — there's no route to define or fetch call to write.
- **`lib/` → Prisma → Postgres.** All of the above bottom out in `src/lib/prisma.ts`, a lazily-instantiated singleton `PrismaClient`, which issues parameterized SQL to whatever Postgres instance `DATABASE_URL` points at. **Nothing in the code references Supabase specifically** — see the correction in §12.
- **File uploads → local disk**, not the database or any object storage. `src/lib/upload.ts` writes straight to `public/uploads/media/` on the server's own filesystem and records a row in `MediaAsset` pointing at that path. This has a major deployment implication — see §12 and §15.

---

## 2. Project structure

```
light-textiles/
├── prisma/
│   ├── schema.prisma          # Single source of truth for the DB (17 models, 5 enums)
│   ├── migrations/             # 3 migrations: init, add_contact_request, add_rbac_warehouses_notifications
│   ├── seed.ts                 # One-time data import script (scraped catalog → Postgres + downloaded images)
│   └── seed-data/              # Raw scraped JSON the seed script consumes
├── public/
│   └── uploads/
│       ├── products/            # Images written by prisma/seed.ts at seed time
│       └── media/                # Images written by the admin Media Library uploader at runtime
├── messages/
│   ├── uk.json, en.json, ru.json # next-intl translation catalogs (all UI strings, public + admin)
├── scripts/
│   └── export-demo-data.ts      # Leftover from a since-reverted "static demo" build (see note below)
├── src/
│   ├── app/
│   │   ├── [locale]/            # Public storefront — every route is locale-prefixed (uk/en/ru)
│   │   ├── admin/                # Admin back office — NOT locale-prefixed, has its own locale switcher
│   │   └── api/                  # Route Handlers used by client components
│   ├── components/
│   │   ├── home/                 # Homepage sections (Hero, Advantages, Reviews, Faq, …)
│   │   ├── product/               # Product gallery, purchase panel, product card, stock-by-warehouse
│   │   ├── catalog/                # Catalog toolbar (sort/filter) and pagination
│   │   ├── admin/                  # Admin-only shared UI (sidebar, forms, notification bell, RBAC-aware bits)
│   │   ├── layout/                  # Site header/footer, locale switcher, page transitions
│   │   ├── ui/                       # Generic primitives (Button, Card, Input, Textarea, PageHero)
│   │   ├── brand/                     # Logo mark
│   │   └── icons/                      # Hand-drawn social icons
│   ├── lib/                       # Data access + business logic + cross-cutting concerns (see table below)
│   ├── i18n/                      # next-intl configuration (routing, request config, typed navigation)
│   ├── stores/                    # Zustand client-side state (cart, favorites)
│   └── middleware.ts               # Runs on every request except static assets/API (see §4)
├── next.config.ts                 # next-intl plugin wiring + next/image remotePatterns
├── render.yaml                     # Render Blueprint — build/start commands, plan, region
└── .env.example                     # Documents the 4 environment variables this app uses
```

### `src/lib/` — file-by-file

| File | Purpose |
|---|---|
| `prisma.ts` | Lazy Prisma Client singleton (see §4 for why it's a `Proxy`) |
| `session.ts` / `session-token.ts` | Cookie-based admin session: HMAC-signed token creation/verification |
| `auth-actions.ts` | `adminLogin` / `adminLogout` server actions |
| `rbac.ts` / `rbac-policy.ts` | Role → resource permission tables + `assertRole`/`assertCanEdit` guards |
| `role-label.ts` | Maps an `AdminRole` to an i18n message key for display |
| `admin-locale.ts` | Reads/writes the admin panel's own locale preference (separate from the public site's) |
| `categories.ts` | `getCategoryTree()` — builds the nested nav/catalog category tree |
| `products.ts` | Catalog querying (`getProductsForCategoryIds`, `getProductBySlug`) + `toProductCardData` mapper |
| `orders.ts` | `createOrder()` — the single place an `Order` + `OrderItem`s get written |
| `notifications.ts` | `notifyNewOrder()`, `maybeNotifyLowStock()` — writes `Notification` rows |
| `site-settings.ts` | Reads `SiteSettings` with hardcoded fallback values if the row doesn't exist yet |
| `seo.ts` | Builds `hreflang` alternate-language link sets for metadata |
| `get-localized.ts` | Picks the right language out of a `{uk, en, ru}` JSON blob, falling back to `uk` |
| `slugify.ts` | URL-slug generation (Cyrillic → Latin transliteration for product/category slugs) |
| `upload.ts` | Writes an uploaded `File` to `public/uploads/media/` and creates a `MediaAsset` row |
| `utils.ts` | `cn()` (clsx + tailwind-merge) and `formatPrice()` |
| `validation/contact.ts`, `validation/order.ts` | Zod schemas shared between client forms and API routes |
| `demo-store.ts` | **Dead code** — see callout below |

> **`demo-store.ts` is not used anywhere.** A grep across `src/` for `demo-store` finds zero importers. It's an in-memory data layer (with its own `AdminRole = "OWNER" | "STAFF"` type, notably different from the real Prisma enum) left over from the `1552b1f Convert to a fully self-contained portfolio demo` commit. The very next commit (`38b0406 Restore Prisma/Postgres production backend`) reverted the app back to Postgres and evidently didn't delete this file or `scripts/export-demo-data.ts`. Both are safe to delete; do not treat `demo-store.ts`'s `"STAFF"` role as real — it isn't.

---

## 3. Frontend

### App Router structure

Two independent route trees share one Next.js app:

- **`src/app/[locale]/**`** — the public storefront. The dynamic `[locale]` segment is populated by `generateStaticParams()` in `src/app/[locale]/layout.tsx` for `uk`, `en`, `ru`. `next-intl`'s `localePrefix: "as-needed"` (in `src/i18n/routing.ts`) means the default locale (`uk`) has **no** URL prefix (`/catalog`) while `en`/`ru` do (`/en/catalog`, `/ru/catalog`).
- **`src/app/admin/**`** — the back office, deliberately outside `[locale]`, with its own independent locale mechanism (`admin-locale.ts`, a cookie, not a URL segment) so admin URLs stay stable (`/admin/products`) regardless of the operator's display language. Inside it, `(dashboard)` is a **route group** — it adds a shared layout (sidebar + notification bell, in `src/app/admin/(dashboard)/layout.tsx`) to every page under it without adding `/dashboard` to the URL. `/admin/login` sits outside the group so it renders without the sidebar.

### Layouts

- `src/app/[locale]/layout.tsx`: wraps every public page in `NextIntlClientProvider`, `SiteHeader`, `PageTransition`, `SiteFooter`. Critically sets **`export const dynamic = "force-dynamic"`** — the comment in the file explains why: `SiteHeader`/`SiteFooter` read categories and site settings from the database on every render, and Render's build step doesn't have `DATABASE_URL` available, so nothing under this layout can be statically prerendered at build time. This means the entire public site is server-rendered fresh on every request (see §16 for the performance implication).
- `src/app/admin/layout.tsx`: root admin layout, sets `robots: { index: false, follow: false }` so search engines never index the back office, and provides the admin's own `NextIntlClientProvider`.
- `src/app/admin/(dashboard)/layout.tsx`: the actual dashboard chrome — `AdminSidebar` (role-aware nav, see §7) + `NotificationBell`.

### Localization (next-intl)

- `src/i18n/routing.ts`: 3 locales (`uk`, `en`, `ru`), default `uk`, `as-needed` prefixing, and a `NEXT_LOCALE` cookie (1-year `maxAge`) that remembers a visitor's chosen locale.
- `src/i18n/request.ts`: resolves the active locale per-request and dynamically `import()`s the matching `messages/{locale}.json`.
- `src/i18n/navigation.ts`: re-exports `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname` from `next-intl/navigation`, pre-bound to `routing` — **always import `Link` from `@/i18n/navigation`, never `next/link`**, on public pages, so locale prefixes are added automatically.
- All UI copy — storefront and admin — lives in `messages/*.json`, not hardcoded strings, so translating or rewording anything is a JSON edit, not a code change.
- Product/category **content itself** (names, descriptions) is stored differently: as a `Json` column shaped `{ uk: string, en: string, ru: string }` directly on the `Product`/`Category` row (see §5), read via `getLocalized()`.

### Theming

`next-themes` (`src/components/theme-provider.tsx`, toggled via `theme-toggle.tsx`) drives light/dark mode using a `class` strategy against CSS custom properties defined in `src/app/globals.css` (`--color-surface`, `--color-ink`, `--color-accent`, `--shadow-soft`, `--shadow-lifted`, etc., redefined under a dark-mode selector). Every component styles against these variables rather than hardcoded Tailwind color utilities, so the whole UI reacts to the theme toggle uniformly.

### State management

Two small **Zustand** stores, both using the `persist` middleware to survive reloads via `localStorage`:

- `src/stores/cart-store.ts` — cart line items (`productId`, optional `variantId`, `price`, `quantity`, …). `price` is captured **client-side at add-to-cart time** and never re-validated server-side — this is a real security issue, detailed in §15.
- `src/stores/favorites-store.ts` — just an array of favorited `productId`s.

There is no global server-state cache (no React Query/SWR) — Server Components fetch fresh on every navigation because of `force-dynamic`, and the two client stores cover the only state that needs to survive across page loads.

### Forms

Every user-facing form (checkout, contact/custom-order, admin product/category/staff forms) follows the same stack: **`react-hook-form`** for form state + **`zod`** schemas (in `src/lib/validation/*.ts` for public forms) resolved through **`@hookform/resolvers/zod`**. Admin forms that don't post to a public API (e.g. `product-form.tsx`) validate inline and call a Server Action directly instead of a zod schema shared with an API route.

### Animations (Framer Motion)

`framer-motion` is used throughout for: page-transition fades (`components/layout/page-transition.tsx`), the homepage `Hero` entrance + **hover interaction** (see below), category card hover motion (`category-card-motion.tsx`), cart line-item layout animations (`motion.div layout` in the cart page), and the quick-order modal's enter/exit (`AnimatePresence`).

**Hero hover effect (this task):** `src/components/home/hero.tsx` now wraps the hero image in a `group` container with three layered hover behaviors, all triggered by a single `group-hover`/`whileHover`:
1. An ambient blue glow (`bg-[var(--color-accent)]/35 blur-2xl`) positioned *outside* the image's `overflow-hidden` clip so it blooms past the rounded corners instead of being cut off.
2. A Framer Motion `whileHover={{ scale: 1.04 }}` on the rounded, `overflow-hidden` image container itself — scaling the whole card (not just the `<img>`) keeps the `rounded-[2.5rem]` border-radius visually correct at any scale.
3. A CSS `transition-shadow` that swaps `--shadow-lifted` for a stronger, blue-tinted `box-shadow` on hover, plus a slightly brighter inset ring.
All three use a 500ms `ease-out`/cubic-bezier timing to read as premium rather than snappy.

### Data fetching patterns

| Pattern | Where | Example |
|---|---|---|
| Server Component → `lib/*.ts` → Prisma | Most public + admin pages | `HomePage`, `CatalogRootPage`, `AdminDashboardPage` |
| Client Component → `fetch("/api/...")` | Favorites page, checkout submit, quick-order modal, notification bell, admin media uploader | `FavoritesPage` calls `/api/products/by-ids` |
| Client Component → Server Action | Every admin create/update/delete/toggle | `deleteProduct(id)` called from a client button |

---

## 4. Backend

### API Route Handlers (`src/app/api/**`)

| Route | Method(s) | Auth | Purpose |
|---|---|---|---|
| `/api/contact` | `POST` | none (public) | Validates (`contactRequestSchema`) and creates a `ContactRequest` row |
| `/api/orders/checkout` | `POST` | none (public) | Validates (`checkoutSchema`) and calls `createOrder()` for a full cart checkout |
| `/api/orders/quick` | `POST` | none (public) | Validates (`quickOrderSchema`) and calls `createOrder()` for a single-item "quick order" |
| `/api/products/by-ids` | `GET` | none (public) | Batch product lookup by `?ids=a,b,c` — powers the Favorites page |
| `/api/admin/notifications` | `GET`, `PATCH` | session required (any role) | Lists/marks-read notifications addressed to the caller's role |
| `/api/admin/upload` | `POST` | session required (any role) | Saves an uploaded file, returns its URL — see §15 for the missing RBAC check here |

All of these are thin: parse input (zod for the public ones), delegate to `lib/`, return `NextResponse.json`.

### Server Actions (`src/app/admin/(dashboard)/**/actions.ts`)

Every admin mutation is a `"use server"` function. The pattern is identical everywhere: call an `assert*` guard from `src/lib/rbac.ts` **first**, then do the Prisma write, then `revalidatePath(...)` the affected pages (often including `revalidatePath("/", "layout")` so public pages relying on cached layout data refresh immediately). Full inventory:

| File | Exports |
|---|---|
| `products/actions.ts` | `createProduct`, `updateProduct`, `deleteProduct`, `toggleProductVisibility` |
| `categories/actions.ts` | `createCategory`, `updateCategory`, `deleteCategory`, `toggleCategoryVisibility` |
| `orders/actions.ts` | `updateOrderStatus` |
| `warehouses/actions.ts` | `recordIncoming`, `recordOutgoing`, `transferStock`, `adjustStock` |
| `reviews/actions.ts` | `toggleReviewApproval`, `deleteReview`, `createReview` |
| `homepage/actions.ts` | `createBanner`, `toggleBannerActive`, `deleteBanner`, `createFaqItem`, `toggleFaqActive`, `deleteFaqItem` |
| `contacts/actions.ts` | `updateSiteSettings` |
| `seo/actions.ts` | `updateGlobalSeo` |
| `media/actions.ts` | `deleteMediaAsset` (also unlinks the file from disk) |
| `users/actions.ts` | `createStaffUser`, `updateStaffUser`, `toggleStaffActive`, `deleteStaffUser`, `transferOwnership`, `updateOwnProfile` |

### `middleware.ts` — full explanation

```ts
const ROUTE_ROLES = [
  { prefix: "/admin/users",       roles: ["OWNER"] },
  { prefix: "/admin/warehouses",  roles: ["OWNER", "MANAGER", "WAREHOUSE"] },
];
```

For every request:
1. If the path starts with `/admin`: verify the `admin_session` cookie (`verifySessionToken`). No session + not `/admin/login` → redirect to login. Valid session + on `/admin/login` → redirect to `/admin`. Valid session on a path matching `ROUTE_ROLES` whose `roles` doesn't include the caller's role → redirect to `/admin`. Every other `/admin/*` path is reachable by **any** signed-in role at the middleware layer (finer-grained resource permissions are enforced inside Server Actions via `rbac-policy.ts`, not here).
2. Otherwise: hand off to `next-intl`'s middleware for locale resolution.

The `matcher` (`/((?!api|_next|_vercel|uploads|.*\\..*).*)`) excludes API routes, Next internals, uploaded files, and any path with a file extension — so `middleware.ts` never runs for `/api/**` or static assets, which is why the API routes each re-check `getSession()` themselves.

### Validation

Zod schemas in `src/lib/validation/` (`contact.ts`, `order.ts`) are the single source of truth for public-form input shape, shared between `react-hook-form`'s `zodResolver` (client-side UX validation) and `.safeParse()` inside the matching API route (server-side enforcement — the client check alone is never trusted).

### Business logic in `lib/`

Order totals, order numbers, low-stock threshold checks, and notification fan-out are all centralized in `lib/orders.ts` and `lib/notifications.ts` so both `/api/orders/checkout` and `/api/orders/quick` share one `createOrder()` implementation instead of duplicating it.

---

## 5. Database

Provider: **PostgreSQL**, accessed exclusively through Prisma (`prisma/schema.prisma`). 3 migrations applied so far: `init`, `add_contact_request`, `add_rbac_warehouses_notifications`.

```mermaid
erDiagram
    Category ||--o{ Category : "parent/children"
    Category ||--o{ Product : "has"
    Product ||--o{ ProductImage : "has"
    Product ||--o{ ProductVariant : "has"
    Product ||--o{ StockLevel : "stocked in"
    Product ||--o{ Review : "reviewed by"
    Product ||--o{ OrderItem : "ordered as"
    Warehouse ||--o{ StockLevel : "holds"
    Warehouse ||--o{ StockMovement : "records"
    Order ||--o{ OrderItem : "contains"
    AdminUser ||--o{ StockMovement : "performed by"
    Order ||--o{ Notification : "triggers"
    Product ||--o{ Notification : "triggers"
```

### Every model

| Model | Purpose | Key relationships | Written by | Rendered where |
|---|---|---|---|---|
| **AdminUser** | Back-office operator account (`OWNER`/`MANAGER`/`WAREHOUSE`/`EMPLOYEE`) | 1—many `StockMovement.createdByUser` | `prisma/seed.ts` (initial OWNER); `users/actions.ts` (OWNER-only CRUD) | `/admin/users`, sidebar operator name, `createdByUser` on stock movement history |
| **Category** | Catalog taxonomy node, self-referential tree (`parentId`) | many Products; parent/children self-relation | `categories/actions.ts` | Catalog nav, `/catalog`, `/catalog/[slug]`, homepage "popular categories" |
| **Product** | A sellable item — localized name/description, price, availability, visibility/featured flags | belongs to Category; has Images, Variants, Reviews, OrderItems, StockLevels, StockMovements, Notifications | `products/actions.ts`; `prisma/seed.ts` at import time | Catalog grid, product page, homepage featured section, cart/checkout item snapshots |
| **ProductImage** | One gallery image for a product, ordered | belongs to Product | `products/actions.ts` (bulk replace on update), seed script | Product gallery, product cards, cart thumbnails |
| **ProductVariant** | A named size/price option under a product (e.g. "Наволочка 50×70") | belongs to Product; referenced by OrderItem | `products/actions.ts` | Variant picker on product page, cart/order line snapshot |
| **Warehouse** | A physical stock location | has StockLevels; source/dest of StockMovements | Seeded once (`radomyshl`, `horenychi`); not editable via UI beyond `warehouses/actions.ts` movements | Stock-by-warehouse display on product page, `/admin/warehouses` |
| **StockLevel** | Current quantity of one product at one warehouse (`@@unique([productId, warehouseId])`) | belongs to Product + Warehouse | `warehouses/actions.ts` (`recordIncoming`/`recordOutgoing`/`transferStock`/`adjustStock`) | Product page "stock by warehouse", low-stock dashboard widget |
| **StockMovement** | Immutable audit log entry for every stock change (`INCOMING`/`OUTGOING`/`TRANSFER`/`ADJUSTMENT`) | belongs to Product, optionally Warehouse or from/to Warehouse pair, and to the `AdminUser` who made it | `warehouses/actions.ts` | `/admin/warehouses/[id]` movement history |
| **Order** | A customer order — contact/delivery info, status, total | has OrderItems, Notifications | `lib/orders.ts::createOrder()` (from checkout/quick-order APIs) | `/admin/orders`, `/admin/orders/[id]`, admin dashboard recent-orders widget |
| **OrderItem** | One line of an order, with a **price snapshot** (`nameSnapshot`, `unitPrice`, `lineTotal`) frozen at order time so later product edits don't retroactively change historical orders | belongs to Order; optionally references Product/ProductVariant (nullable — order survives product deletion via `onDelete: SetNull`) | `lib/orders.ts::createOrder()` | Order detail page |
| **Review** | A customer testimonial, optionally tied to a product | optionally belongs to Product | `reviews/actions.ts` — admin-authored only (`createReview` always sets `productId: null`, `isApproved: true`); there is **no public review-submission endpoint** | Homepage "Reviews" section, `/admin/reviews` |
| **SiteSettings** | Singleton row (`id: "main"`) for contact info, hero copy, about/delivery text, footer text, global SEO defaults | none | `contacts/actions.ts`, `homepage/actions.ts`, `seo/actions.ts` | Header/footer contact info, homepage hero (if set), About/Delivery sections |
| **Banner** | A homepage promo banner (image + optional link) | none | `homepage/actions.ts` | Homepage `PromoBanners` |
| **FaqItem** | One Q&A pair | none | `homepage/actions.ts` | Homepage `Faq` section |
| **ContactRequest** | A submission from the public contact/custom-order form | none | `/api/contact` (public, unauthenticated) | `/admin/contacts` inbox |
| **MediaAsset** | Metadata for an uploaded file (URL, filename, size, MIME) | none directly (products/categories/banners store the URL string, not a foreign key) | `/api/admin/upload` → `lib/upload.ts` | `/admin/media` library grid, used as an image picker source in product/category/banner forms |
| **Notification** | An in-app alert (`NEW_ORDER`, `LOW_STOCK`) targeted at one or more roles via `audienceRoles: AdminRole[]` | optionally references Order or Product | `lib/notifications.ts` | Admin `NotificationBell` (polled via `/api/admin/notifications`) |

**Enums:** `AdminRole` (OWNER/MANAGER/WAREHOUSE/EMPLOYEE), `Availability` (IN_STOCK/OUT_OF_STOCK/ON_ORDER), `StockMovementType`, `OrderStatus` (NEW→CONFIRMED→PACKING→SHIPPING→COMPLETED, or CANCELLED), `PaymentMethod`, `NotificationType`.

**Localization convention:** anywhere content is customer-facing and translatable, the column is a Prisma `Json` field shaped `{ uk: string, en: string, ru: string }` rather than separate columns or a translations table — read through `getLocalized(value, locale)`, which falls back to `uk` then to the first available language if the requested locale is missing.

**One raw SQL query exists** in the entire codebase: the admin dashboard's low-stock widget (`src/app/admin/(dashboard)/page.tsx:30`) uses `prisma.$queryRaw` with a fully static tagged-template query (no interpolated variables) to join `StockLevel`/`Product`/`Warehouse` and filter `quantity <= lowStockThreshold` — something the Prisma query builder can't express directly. It's parameterized correctly (Prisma tagged templates escape any interpolated values automatically) and poses no injection risk since nothing is actually interpolated.

---

## 6. Authentication & Authorization

### Login flow

1. Admin submits email/password on `/admin/login`.
2. `adminLogin()` (`src/lib/auth-actions.ts`, a Server Action) looks up `AdminUser` by email, checks `isActive`, and verifies the password with `bcrypt.compare()` against `passwordHash`.
3. On success, `setSessionCookie()` (`src/lib/session.ts`) creates a signed token (`createSessionToken`) containing `{ id, email, name, role, exp }` and sets it as the `admin_session` cookie: `httpOnly: true`, `sameSite: "lax"`, `secure` only in production, 7-day `maxAge`.
4. `adminLogout()` just deletes the cookie and redirects to `/admin/login`.

### Session mechanics

`src/lib/session-token.ts` implements a minimal signed-token scheme by hand (not a JWT library) using the **Web Crypto API** specifically so the same sign/verify code runs unmodified in both the Node runtime (Server Actions/API routes) and the **Edge runtime** middleware executes in — Prisma can't run on Edge, so this design lets `middleware.ts` verify a session without needing a database round-trip or a Node-only crypto module.

- Token format: `base64url(JSON payload).base64url(HMAC-SHA256 signature)`.
- `SESSION_SECRET` (env var) is the HMAC key — see §10 for what happens if it's missing.
- `verifySessionToken` recomputes the signature and compares, then checks `exp` against the current time. Malformed, unsigned, or expired tokens all return `null`.

### Role hierarchy & permissions

Roles are **not** a strict linear hierarchy where each level is a superset of the one below — `MANAGER` and `WAREHOUSE`/`EMPLOYEE` have genuinely different, non-overlapping capability sets, defined in `src/lib/rbac-policy.ts`:

```mermaid
flowchart TD
    OWNER["OWNER\nfull access to every resource,\nplus /admin/users and staff management"]
    MANAGER["MANAGER\nproducts, categories, orders, warehouses,\nmedia, homepage, reviews, seo, contacts"]
    WAREHOUSE["WAREHOUSE\nview: products, orders, warehouses, account\nedit: warehouses, orders only"]
    EMPLOYEE["EMPLOYEE\nview: products, orders, account\nedit: orders only"]

    OWNER -.->|superset of| MANAGER
    MANAGER -.->|not a superset of| WAREHOUSE
    MANAGER -.->|not a superset of| EMPLOYEE
```

Two tables drive everything: `NAV_ACCESS` (what a role can *see*) and `EDIT_ACCESS` (what a role can *mutate*) — both `Record<AdminRole, Resource[]>`. `canView()`/`canEdit()` are pure lookups against them.

- `OWNER` — every `Resource` in both tables, **plus** exclusive access to `/admin/users` (staff account management, enforced both in `middleware.ts`'s `ROUTE_ROLES` and again inside every `users/actions.ts` export via `assertRole("OWNER")`) and can `transferOwnership()` to hand the OWNER role to someone else (demoting themselves to `MANAGER` in the same transaction).
- `MANAGER` — can view/edit almost everything **except** `users` — effectively "run the business" without being able to create/remove other admins.
- `WAREHOUSE` — scoped to physical inventory: can view products/orders/warehouses/account, but can only *edit* `warehouses` (stock movements) and `orders` (status updates). Also has `/admin/warehouses` route access per `middleware.ts`.
- `EMPLOYEE` — the narrowest role: can view products/orders/account, can only edit `orders` (i.e., update order status — the day-to-day order-fulfillment role).

**Two enforcement layers, working together:**
1. `middleware.ts` — coarse, path-prefix-based, only for `/admin/users` (OWNER-only) and `/admin/warehouses` (OWNER/MANAGER/WAREHOUSE). Everything else under `/admin` just requires *some* valid session at this layer.
2. `src/lib/rbac.ts`'s `assertCanEdit(resource)` / `assertRole(...)` — fine-grained, called at the top of **every** Server Action, throwing `UnauthorizedError` if the caller's role isn't permitted. This is the real enforcement boundary for most resources; the sidebar additionally calls `canView()` to hide nav items the current role can't use, but that's a UX nicety, not a security control (see §15 for where this pattern has a gap).

---

## 7. Admin panel

All routes below are under `/admin` (no locale prefix). "Roles" reflects the **effective** access after combining `middleware.ts` route gating with each page/action's own `assertCanEdit`/`assertRole` calls.

| Route | Purpose | Roles that can reach it |
|---|---|---|
| `/admin/login` | Sign in | Public (redirects away if already signed in) |
| `/admin` | Dashboard — product/category/order counts, revenue (OWNER only), recent orders, low-stock alerts (non-OWNER only) | Any signed-in role |
| `/admin/products` | Product list, visibility toggle | View: all. Edit: OWNER, MANAGER |
| `/admin/products/new`, `/admin/products/[id]` | Create/edit a product (name/desc per locale, price, images, variants, category) | OWNER, MANAGER |
| `/admin/categories`, `/admin/categories/new`, `/admin/categories/[id]` | Category tree management | OWNER, MANAGER |
| `/admin/orders`, `/admin/orders/[id]` | Order list + detail, status updates | View: OWNER, MANAGER, WAREHOUSE, EMPLOYEE. Edit status: all four (all roles can edit `orders`) |
| `/admin/warehouses`, `/admin/warehouses/[id]` | Stock levels, incoming/outgoing/transfer/adjustment movements | OWNER, MANAGER, WAREHOUSE (both nav + edit) |
| `/admin/reviews` | Approve/reject/delete reviews, author a new one | OWNER, MANAGER |
| `/admin/media` | Upload/browse/delete image assets | OWNER, MANAGER (nav+edit) — **but see §15: the underlying upload API doesn't actually enforce this** |
| `/admin/homepage` | Manage banners and FAQ items | OWNER, MANAGER |
| `/admin/contacts` | Inbox of `ContactRequest` submissions, and edit `SiteSettings` (phone/viber/email/hours/address/socials) | OWNER, MANAGER |
| `/admin/seo` | Edit global `metaTitle`/`metaDescription` defaults | OWNER, MANAGER |
| `/admin/users`, `/admin/users/new`, `/admin/users/[id]` | Create/edit/deactivate/delete staff accounts, transfer ownership | **OWNER only** (enforced in `middleware.ts` and every `users/actions.ts` export) |
| `/admin/account` | Edit your own name/email/password | Any signed-in role |

---

## 8. Public website

All routes below are under `src/app/[locale]/**`, i.e. locale-prefixed except for the default `uk` locale.

| Route | Purpose | Data source |
|---|---|---|
| `/` | Homepage: hero, promo banners, advantages, popular categories, featured products, about, delivery, reviews, FAQ, contact form | Server Component tree, each section fetching directly via `lib/` (categories, products, site-settings, reviews, FAQ) |
| `/catalog` | Root catalog — grouped category grid | `getCategoryTree()` |
| `/catalog/[slug]` | One category's product listing, with sort/price filters and pagination | `getCategoryBySlug()` + `getProductsForCategoryIds()` |
| `/product/[slug]` | Product detail: gallery, purchase panel, stock-by-warehouse, similar products, `Product` JSON-LD for SEO | `getProductBySlug()` (direct Prisma, includes images/variants/stockLevels) |
| `/cart` | Cart contents, quantity edit, remove, subtotal | 100% client-side — reads `useCartStore` (localStorage), no server call |
| `/checkout` | Delivery/contact form + order summary → `POST /api/orders/checkout` | Client form + cart store; server writes via `lib/orders.ts` |
| `/favorites` | Grid of favorited products | Client-side `useFavoritesStore` (IDs) → `fetch("/api/products/by-ids")` to hydrate full product data |
| `/about` | Static-ish content page | `SiteSettings.aboutText` with fallback |
| `/delivery` | Delivery info page | `SiteSettings.deliveryText` with fallback |
| `/contacts` | Contact info + contact form | `SiteSettings` + `ContactForm` → `POST /api/contact` |
| `/custom-order` | Custom-order pitch + the same `ContactForm` | Static copy (`messages/*.json`) + `ContactForm` |

Quick add-to-cart and the "quick order" (buy-now) modal on the product page both live client-side in `product-purchase-panel.tsx`; quick order posts straight to `/api/orders/quick`, bypassing the cart entirely.

---

## 9. Deployment

```mermaid
flowchart LR
    Dev["git push (any branch Render is watching)"] --> GH["GitHub"]
    GH --> Render["Render picks up the push"]
    Render --> Build["buildCommand:\nnpm ci && npm run build"]
    Build --> PI["npm ci triggers\npostinstall → prisma generate"]
    PI --> NB["next build\n(force-dynamic layout skips DB-dependent prerendering)"]
    NB --> Start["startCommand:\nnpm run start → next start"]
    Start --> Live["Live on Render's assigned URL / custom domain"]
    Live -.->|every request| PG[("Postgres via DATABASE_URL")]
```

**Exactly what happens after `git push`** (per `render.yaml` + `package.json`):
1. Render detects the push and starts a new deploy using `buildCommand: npm ci && npm run build`.
2. `npm ci` installs dependencies and, per `package.json`'s `"postinstall": "prisma generate"`, runs `prisma generate` immediately after install — regenerating the Prisma Client types/binaries for the target platform. This step does **not** need `DATABASE_URL` (it only reads `schema.prisma`).
3. `npm run build` runs `next build`. Because `src/app/[locale]/layout.tsx` sets `dynamic = "force-dynamic"`, Next.js does not attempt to statically prerender any page under it at build time — this was explicitly added (commit `3a23ce7 Fix Render build failure: prerendering required DATABASE_URL`) because the build environment has no database connection.
4. On success, Render starts the app with `startCommand: npm run start` → `next start`, listening on the port Render provides.
5. `healthCheckPath: /` — Render polls `/` and only routes traffic to the new instance once it responds successfully, giving zero-downtime deploys.
6. From that point on, every request to the live app hits the Node server directly, which queries Postgres via `DATABASE_URL` per-request (no build-time data baked in).

**Database migrations are not part of this pipeline.** Nothing in `render.yaml` or the npm scripts runs `prisma migrate deploy`. New migrations under `prisma/migrations/` must be applied manually (or added to the build/start command) — currently that's a manual step against the production `DATABASE_URL`.

`render.yaml` has no `autoDeploy` key, so it uses Render's default (auto-deploy enabled for the connected branch) unless overridden in the Render dashboard — confirm this in the dashboard rather than assuming from the file alone.

---

## 10. Environment variables

| Variable | Used in | Required? | What breaks if missing |
|---|---|---|---|
| `DATABASE_URL` | `src/lib/prisma.ts` (implicitly, via `datasource db` in `schema.prisma`) | **Yes**, at runtime | Every Prisma query throws on first use. `prisma.ts` is deliberately lazy (`Proxy`-wrapped) precisely so importing it doesn't fail at build time when this isn't set yet — but any page render or Server Action that touches the DB will fail once traffic arrives. |
| `SESSION_SECRET` | `src/lib/session-token.ts:37` | **Yes**, for any admin auth | `getSecret()` throws immediately ("SESSION_SECRET environment variable is not set...") the moment any code tries to sign or verify a session — meaning admin login is completely broken. |
| `NEXT_PUBLIC_SITE_URL` | `src/lib/seo.ts:3` | No (has a hardcoded fallback: `https://light-textiles.com.ua`) | `hreflang`/canonical URLs in page `<head>` metadata will point at the fallback domain instead of wherever the app is actually deployed — silently wrong SEO metadata on any non-production deploy, not a functional break. Because it's `NEXT_PUBLIC_*`, it's also inlined into client bundles at build time — changing it requires a rebuild, not just a restart. |
| `OWNER_EMAIL` | `prisma/seed.ts` only | No (falls back to `dima83ido@gmail.com`) | Only affects `npm run db:seed` — see the hardcoded-credential finding in §15. Not read anywhere outside the seed script. |
| `OWNER_PASSWORD` | `prisma/seed.ts` only | No (falls back to the literal string `LightTextiles2026!`) | Same as above — seeding without this set creates the OWNER account with a publicly-visible-in-source-control default password. |
| `NODE_ENV` | `src/lib/session.ts:23` (implicitly set by Next.js/Render, not something you configure yourself) | N/A | Controls the `secure` flag on the session cookie — `true` only when `NODE_ENV === "production"`. If a production deploy somehow ran with `NODE_ENV` unset, the session cookie would be sent over plain HTTP, which shouldn't happen under Render's standard Next.js deploy but is worth knowing about. |

The local `.env` in this repo currently defines `DATABASE_URL`, `SESSION_SECRET`, and `NEXT_PUBLIC_SITE_URL` only — `OWNER_EMAIL`/`OWNER_PASSWORD` are unset locally, so a local `npm run db:seed` run would fall back to the hardcoded defaults above.

---

## 11. Dependencies

| Package | Why it's used |
|---|---|
| `next` (15.5) | The application framework — App Router, Server Components, Server Actions, Route Handlers, Image optimization, i18n middleware integration |
| `react` / `react-dom` (19.1) | Required peer of Next 15; enables Server Components and the newer `use()`/Actions APIs |
| `prisma` / `@prisma/client` | Type-safe ORM/query builder and its generated client; single interface to Postgres used everywhere in `lib/` |
| `framer-motion` | Declarative animation for page transitions, hero/card hover effects, and the quick-order modal's mount/unmount transitions |
| `tailwindcss` (v4) + `@tailwindcss/postcss` | Utility-first styling; v4's CSS-first config is why theme tokens live as CSS custom properties in `globals.css` rather than a `tailwind.config.js` theme object |
| `next-intl` | All internationalization: locale routing/middleware, message loading, typed navigation helpers, server-side `getTranslations` |
| `next-themes` | Light/dark mode class toggling with system-preference detection and no flash-of-wrong-theme |
| `zod` | Runtime schema validation shared between client forms and server-side API input parsing (`safeParse`) |
| `react-hook-form` + `@hookform/resolvers` | Form state management wired to zod schemas via `zodResolver` |
| `zustand` | Minimal client state for the cart and favorites, with `persist` for `localStorage` durability |
| `bcryptjs` | Password hashing for `AdminUser.passwordHash` (login and staff-account password changes) |
| `sharp` | Next.js's optional-but-recommended native image processor, used by `next/image` for on-the-fly resizing/format conversion |
| `lucide-react` | Icon set used consistently across storefront and admin UI |
| `clsx` + `tailwind-merge` (combined in `lib/utils.ts::cn()`) | Conditional className composition without Tailwind class conflicts |
| `tsx` (dev) | Runs `prisma/seed.ts` and `scripts/export-demo-data.ts` (TypeScript directly, no separate compile step) |

**No Uploadthing, no S3/Supabase Storage SDK, no image-upload-as-a-service package is present.** File uploads are handled entirely by hand in `src/lib/upload.ts` writing to the local filesystem — see §12 for why that matters on Render specifically.

---

## 12. Render specifics

From `render.yaml`:

```yaml
services:
  - type: web
    name: light-textiles
    runtime: node
    plan: free
    region: frankfurt
    buildCommand: npm ci && npm run build
    startCommand: npm run start
    healthCheckPath: /
```

- **Plan:** `free` — note the free tier spins the service down after inactivity and spins it back up on the next request (cold start), and has no persistent disk by default.
- **Region:** `frankfurt` (EU) — reasonable for a Ukraine-based storefront's latency.
- **Build/start commands:** as described in §9.
- **Database connection:** purely via the `DATABASE_URL` environment variable, configured in the Render dashboard (not in `render.yaml`, which defines no `envVars` block or attached database). **Nothing in this codebase references Supabase specifically** — `schema.prisma`'s `datasource db { provider = "postgresql" }` and `.env.example`'s `postgresql://postgres:password@localhost:5432/...` format work against *any* Postgres provider (Render's own managed Postgres, Supabase, Neon, etc.). If this project's production database is in fact Supabase, that's an operational choice made outside this repo, not something the code assumes or depends on — worth confirming in the Render dashboard's env var value rather than assuming.
- **File uploads on Render's free plan are not durable.** `src/lib/upload.ts` and `prisma/seed.ts` both write to `public/uploads/**` on the container's local disk. Render's free web services do **not** have a persistent disk attached by default — every redeploy (and likely every restart/spin-down-spin-up cycle) gets a fresh filesystem, meaning **any image uploaded through the admin Media Library after the last deploy is silently lost** the next time the service restarts or redeploys. This is a significant operational gap — see §15/§16 for the recommended fix (attach a Render persistent disk, or move uploads to object storage).

---

## 13. Custom domain

To point a custom domain (e.g. `light-textiles.com.ua`) at this Render service:

1. **In Render:** open the service → *Settings* → *Custom Domains* → *Add Custom Domain*, enter the domain.
2. **DNS records** (configured wherever the domain is registered/managed): Render will show the exact records to add — typically a `CNAME` record pointing the domain (or `www` subdomain) at the Render-provided hostname, or an `A`/`ALIAS`/`ANAME` record at the apex (root) domain if the DNS provider doesn't support `CNAME` flattening at the apex. Render's dashboard displays the precise values to use once the domain is added.
3. **SSL/HTTPS:** Render automatically provisions and renews a free TLS certificate via Let's Encrypt once DNS is correctly pointed at it — no manual certificate work needed. HTTPS is served automatically; Render also handles HTTP→HTTPS redirection.
4. **Propagation time:** typically minutes to a few hours, but can take up to 24-48 hours depending on the DNS provider's TTL and global propagation.
5. **What needs to change in the project:** update `NEXT_PUBLIC_SITE_URL` (Render env var) to the new domain and **redeploy** (it's inlined at build time, so a plain restart won't pick it up) — this fixes `hreflang`/canonical SEO metadata (§10). No code changes are required beyond that; `next.config.ts`'s `images.remotePatterns` currently only allow-lists `light-textiles.com.ua` for `next/image` remote loading — if the final domain differs, that pattern needs updating too (and if any external image URLs from other hosts are ever used, they'd need adding here as well).

---

## 14. Project workflows

| Task | How |
|---|---|
| **Add a product** | `/admin/products/new` → fill localized name/description, category, price(s), availability, upload/select images, add variants → Save. Requires OWNER or MANAGER. |
| **Add a category** | `/admin/categories/new` → localized name, optional parent (for a subcategory), optional image → Save. OWNER/MANAGER. |
| **Change homepage content** | `/admin/homepage` covers banners and FAQ only. The hero's headline/subtitle text is hardcoded translation keys in `messages/{uk,en,ru}.json` (`heroTitle`, `heroSubtitle`, etc.) — editing it is a JSON edit + redeploy, **not** an admin-panel action. `SiteSettings` does have `heroTitle`/`heroSubtitle`/`heroImage` columns in the schema, but no admin form currently writes to them (grepped: zero references under `src/app/admin`) — they're unused dead columns today. Contact-adjacent copy (phone/hours/address/socials) is covered separately via `/admin/contacts`. |
| **Change contacts** | `/admin/contacts` → the settings form (phone, viber, email, working hours, address, social links) → Save. OWNER/MANAGER. |
| **Change banners** | `/admin/homepage` → add/deactivate/delete banner. OWNER/MANAGER. |
| **Change FAQ** | `/admin/homepage` → add/deactivate/delete FAQ item. OWNER/MANAGER. |
| **Manage warehouses / change stock** | `/admin/warehouses/[id]` → record an incoming shipment, outgoing sale/loss, transfer between warehouses, or a manual adjustment. Every action writes an immutable `StockMovement` row and can trigger a low-stock `Notification`. OWNER/MANAGER/WAREHOUSE. |
| **Change prices** | Edit the product at `/admin/products/[id]` — `basePrice`, `discountPrice`, and per-variant prices. OWNER/MANAGER. |
| **Create a staff account** | `/admin/users/new` — set email, name, password, role. **OWNER only.** |
| **Create an "admin" (OWNER) account** | There is no separate "create OWNER" flow — either seed one via `prisma/seed.ts` (`OWNER_EMAIL`/`OWNER_PASSWORD` env vars, or the hardcoded fallback), or have the current OWNER use `transferOwnership()` on `/admin/users` to hand the role to an existing staff account (this also demotes the current OWNER to MANAGER). |
| **Backup the database** | `pg_dump "$DATABASE_URL" -Fc -f backup.dump` (or plain SQL with `-Fp`) from anywhere with network access to the Postgres instance and the connection string. Automate via a scheduled job outside this repo — nothing in the codebase currently does this for you. |
| **Restore the database** | `pg_restore --clean --if-exists -d "$DATABASE_URL" backup.dump` (matching the dump format used above). Always restore to a *new* database first and verify before pointing production `DATABASE_URL` at it. |

---

## 15. Security audit

Findings are ranked most-severe first. Each was verified directly against the code, not inferred.

### ✅ Fixed — Client-supplied order prices were trusted verbatim (price tampering)

`src/stores/cart-store.ts` stores `price` client-side (set when the item is added to the cart in `product-purchase-panel.tsx:126`). At checkout, `src/app/[locale]/checkout/page.tsx:41-45` sent that stored `price` straight through as `unitPrice` in the `POST /api/orders/checkout` body, and `lib/orders.ts` computed `totalAmount` directly from that unvalidated number — the same was true of the "quick order" flow. Anyone could submit an order at any price they chose by editing `localStorage` (`light-textiles-cart`) or the request body.

**Status: fixed in this review.** `lib/orders.ts` now has a `resolveAuthoritativeItems()` step that re-fetches each `productId`/`variantId` from the database and recomputes `unitPrice`/`lineTotal`/`totalAmount` server-side — the client-supplied `unitPrice` is only used as the initial cart display value and is fully ignored by `createOrder()`. Only `productId`, `variantId`, `nameSnapshot`, and `quantity` are trusted from the client. Both `/api/orders/checkout` and `/api/orders/quick` now return a `400` (instead of an unhandled `500`) if an item's `productId`/`variantId` doesn't resolve to a real product/variant.

### ✅ Fixed — `/api/admin/upload` didn't enforce the `media` resource permission

`src/app/api/admin/upload/route.ts` only checked `getSession()` (i.e., *any* signed-in admin, any role). `EDIT_ACCESS` in `rbac-policy.ts` only grants `media` edit rights to `OWNER`/`MANAGER` — the Server Action path (`deleteMediaAsset`) correctly called `assertCanEdit("media")`, but nothing stopped a `WAREHOUSE` or `EMPLOYEE` account from `POST`ing directly to `/api/admin/upload` and uploading files anyway. The UI-level restriction gave a false sense of enforcement.

**Status: fixed.** The route now calls `getSession()` (→ `401` if absent) then `canEdit(session.role, "media")` (→ `403` if the role isn't `OWNER`/`MANAGER`) before touching the filesystem.

### ✅ Fixed — Upload endpoint had no file-type, extension, or size validation

`src/lib/upload.ts::saveUploadedFile()` accepted any `File` with no MIME-type allow-list, no extension check, and no size cap, then wrote it directly into `public/uploads/media/` (a statically served, publicly reachable directory) using the browser-supplied `file.type` verbatim. The `<input accept="image/*">` hint in `media-uploader.tsx` is client-side only and trivially bypassed via a direct API call.

**Status: fixed.** `saveUploadedFile()` now rejects (with a specific message, surfaced as `400`) before writing anything to disk if: the file is empty, exceeds **10 MB**, has an extension outside `.jpg/.jpeg/.png/.webp/.gif/.avif`, has a `Content-Type` outside the matching MIME allow-list, or — the actual gate, since extension/MIME are both attacker-controlled — fails to decode as a real image via `sharp(buffer).metadata()`. A file that merely *has* a `.png` name/MIME but isn't real image bytes is rejected. `POST /api/admin/upload` now returns `401` (no session) / `403` (wrong role) / `400` (invalid file) instead of silently succeeding.

### ✅ Fixed — Hardcoded default OWNER credentials committed to source control

`prisma/seed.ts` fell back to `ownerEmail = "dima83ido@gmail.com"` / `tempPassword = "LightTextiles2026!"` when `OWNER_EMAIL`/`OWNER_PASSWORD` weren't set. If `npm run db:seed` were ever run against a real database without those env vars, it would create an OWNER account with a publicly-known, source-controlled password.

**Status: fixed.** The seed script now throws immediately — before creating anything — if `OWNER_EMAIL` or `OWNER_PASSWORD` is unset; there is no fallback. `.env.example` updated to reflect that these are required, not optional. (`seed_log.txt`/`build.log`/`dev_server.log` were confirmed **not** tracked by git — `git log --all` shows no history for them — so the plaintext password that a past local seed run printed to `seed_log.txt` never reached source control. It's still a real, previously-used credential sitting in a local file, though: **rotate it if that OWNER account was ever seeded against a real database.**)

### ✅ Fixed — Several admin pages had no view-permission check at all (broken access control)

`rbac-policy.ts`'s `NAV_ACCESS` map defines which roles should be able to *see* each resource (e.g. `seo`/`homepage`/`categories`/`contacts`/`reviews`/`media` are `OWNER`/`MANAGER`-only — `WAREHOUSE` and `EMPLOYEE` are deliberately excluded). In practice, `NAV_ACCESS` was only ever read to decide which links to render in the sidebar (`admin-sidebar.tsx`). The page components themselves — `src/app/admin/(dashboard)/{seo,homepage,categories,categories/[id],categories/new,contacts,reviews,media}/page.tsx` — had **no server-side check whatsoever**. Any signed-in role (including `EMPLOYEE`) could open e.g. `/admin/seo` or `/admin/contacts` directly by URL and see the full page, even though it wasn't linked from their sidebar. The corresponding Server Actions were correctly protected (`assertCanEdit` blocks the actual writes), so this was a read-only exposure, not a mutation bypass — but it's still real broken access control, and exactly the "don't rely on the frontend" class of bug called out for the upload endpoint.

**Status: fixed.** Added `requireView(resource)` to `src/lib/rbac.ts` — reads the session, checks `canView(role, resource)`, and `redirect("/admin")`s if either fails. Called at the top of all 8 affected page components, plus (defense-in-depth, since `middleware.ts` already restricts this path prefix to `OWNER/MANAGER/WAREHOUSE`) `warehouses/page.tsx` and `warehouses/[id]/page.tsx`. `products`/`orders`/`account` pages were left untouched — those resources are intentionally visible to all four roles per `NAV_ACCESS`, and `/admin/users` already had an equivalent inline check.

### ✅ Fixed — No brute-force protection on admin login

`adminLogin()` in `src/lib/auth-actions.ts` allowed unlimited password attempts against any account with no delay or lockout.

**Status: fixed.** Added a lightweight in-memory rate limiter (`src/lib/rate-limit.ts`) keyed **per attempted email** (not per-IP, so it can't be defeated by rotating IPs) — 5 attempts per 15 minutes. Exceeding it returns `{ error: "rate_limited" }`, which the existing login UI already renders as its generic "invalid credentials" message (no UI change needed, no information leak about the rate limit itself). Note: this is process-local memory, so it resets on deploy/restart and won't coordinate across multiple instances — fine for this app's single-instance Render deployment, but flagged in the module's own comment as needing a shared store (Redis/Upstash) if this ever scales horizontally.

### ✅ Fixed — No rate limiting on public, unauthenticated mutation endpoints

`/api/contact`, `/api/orders/checkout`, and `/api/orders/quick` accept unauthenticated `POST` requests with no throttling — open to spam (contact form) or order-flooding.

**Status: fixed.** Same `rate-limit.ts` module, keyed per client IP (`x-forwarded-for`, falling back to `x-real-ip`): `contact` capped at 10/10min, `checkout` and `quick` at 20/10min each. Exceeding the limit returns `429`.

### ✅ Fixed — No server-side password strength requirement

`createStaffUser`, `updateStaffUser`, and `updateOwnProfile` (`src/app/admin/(dashboard)/users/actions.ts`) hashed and stored whatever password string was submitted — the only guard against an empty/trivial password was the client-side `required` HTML attribute, which isn't a trust boundary.

**Status: fixed.** Added a server-side `assertStrongPassword()` check (minimum 8 characters) called before hashing in all three functions.

### ✅ Fixed — JSON-LD script injection on the product page

`src/app/[locale]/product/[slug]/page.tsx` rendered `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />`. `JSON.stringify` does not escape `<`, so admin-entered product `name`/`description` containing the literal sequence `</script>` would close the JSON-LD script tag early and allow injecting arbitrary HTML/JS into every visitor's page — a stored-XSS-adjacent risk even though the content is admin-authored rather than public user input.

**Status: fixed.** The stringified payload now runs through `.replace(/</g, "\\u003c")` before being injected — every literal `<` character becomes the JSON escape sequence for `<`, which is semantically identical JSON but can no longer break out of the `<script>` tag.

### ✅ Fixed — Unbounded `ids` list on `/api/products/by-ids`

The `ids` query param was split on `,` with no upper bound, so a request with thousands of comma-separated IDs would build a proportionally huge Prisma `IN (...)` query — a cheap, unauthenticated way to load the database.

**Status: fixed.** The parsed ID list is now capped at 100 (`.slice(0, 100)`).

### 🟡 Low (not fixed) — Session cookie has no rotation/invalidation mechanism

Sessions are stateless signed tokens with a 7-day expiry (`session-token.ts`) and no server-side session store — there is no way to invalidate a specific session early (e.g. on password change, suspicious activity, or "log out all devices"). `updateOwnProfile`/`updateStaffUser` change `passwordHash` but any existing session token for that user remains valid until its `exp` regardless. Low severity given the admin-only, presumably small-team context.
**Recommended fix (not applied — needs a schema migration):** add a `sessionVersion`/`tokenIssuedAt` field on `AdminUser`, embed it in the token, and check it against the DB value on each `verifySessionToken()` call; bump it on password change to invalidate all other outstanding sessions for that account.

### 🟡 Low (not fixed) — `ContactRequest` model has no admin UI

`prisma/schema.prisma` defines a `ContactRequest` model and `POST /api/contact` writes to it, but no admin page reads it back — submitted contact-form messages currently have no way to be viewed or marked handled from the dashboard (`/admin/contacts` is actually the site-wide contact **settings** — phone/email/social links — a different thing entirely, despite the similar name). Not a security bug, but worth knowing: customer messages are silently accumulating in the database with no visibility. Out of scope for a security-only pass; flagging for a future feature.

### 🟢 Verified safe — SQL injection

The one raw query in the app (`src/app/admin/(dashboard)/page.tsx:30`, `prisma.$queryRaw`) is a fully static tagged template with zero interpolated values — not exploitable. Every other database access goes through Prisma's query builder, which parameterizes automatically. No SQL injection surface found.

### 🟢 Verified safe — RBAC enforcement in Server Actions

Every admin Server Action across all 10 `actions.ts` files correctly calls `assertCanEdit`/`assertRole` as its first line before touching the database — this pattern is consistent with no exceptions found.

### 🟢 Verified safe — CSRF

The session cookie is set with `sameSite: "lax"` (`session.ts`) and `secure: true` in production, which blocks the cookie from being sent on cross-site `POST`/`fetch` requests (only top-level cross-site navigations, i.e. `GET`, still attach it) — this mitigates CSRF for all cookie-authenticated Server Actions and API routes without any additional token needed.

### 🟢 Verified safe — Privilege escalation via account self-service

`updateOwnProfile` only accepts `{ name, email, password }` — there's no `role` field, so no signed-in user (of any role) can elevate their own privileges through it. All role changes (`createStaffUser`, `updateStaffUser`, `transferOwnership`) are gated behind `assertOwner()` (`OWNER`-only), and `toggleStaffActive`/`deleteStaffUser`/`transferOwnership` all explicitly no-op if the target is the caller's own account (`session.id === id`), preventing self-lockout or accidental self-demotion edge cases.

---

## 16. Performance audit

### Images

`next/image` is used consistently (hero, product gallery, category cards, cart thumbnails) with explicit `sizes` attributes, so responsive srcsets are generated correctly. `sharp` is installed, enabling Next's native on-the-fly resizing/format conversion (AVIF/WebP) rather than falling back to the slower WASM image processor. `next.config.ts`'s `images.remotePatterns` only allow-lists `light-textiles.com.ua` — all current product/category images are served locally from `public/uploads/**`, so this is currently unused but correctly scoped (not wildcarded).

### No caching or ISR anywhere on the public site

`src/app/[locale]/layout.tsx:17` sets `export const dynamic = "force-dynamic"` for the entire public site tree, and no page or `lib/` data function uses `unstable_cache`, `revalidate`, or `fetch`'s built-in caching. This means **every single request** — including the homepage, catalog pages, and product pages, none of which change per-visitor — re-runs its full set of Prisma queries from scratch. For a catalog site where product/category data changes infrequently (admin edits, not per-request), this is the single biggest performance lever available:
**Recommendation:** switch from blanket `force-dynamic` to either (a) per-page `export const revalidate = 60` (or similar) for genuinely public, cacheable pages like `/`, `/catalog`, `/catalog/[slug]`, `/product/[slug]`, while keeping something dynamic (like the header's cart count, which is already client-only via Zustand and unaffected by this) working correctly, or (b) wrap the specific `lib/` functions that back `SiteHeader`/`SiteFooter` (the actual reason `force-dynamic` was added, per the code comment) in `unstable_cache` with a short TTL, and drop `force-dynamic` from the layout entirely so leaf pages can be statically/ISR-rendered independently.

### N+1 query risk — low, but present

`prisma/seed.ts`'s "Assigning category thumbnails" and "Marking featured products" loops run one query per category/group inside a `for` loop (fine for a one-time seed script, not a runtime concern). At runtime, the audited `lib/*.ts` functions (`getProductsForCategoryIds`, `getProductBySlug`, `getCategoryTree`) all use single queries with `include`/batched `Promise.all`, not per-row loops — no N+1 pattern found in request-path code.

### Bundle size / server-vs-client split

The codebase is disciplined about `"use client"` boundaries — purchase panel, cart/favorites pages, forms, and animated bits are client components; everything else (page shells, data-fetching sections) are Server Components by default, keeping Prisma and other server-only code out of the client bundle. No obvious bloat (no heavy client-side charting/date libraries, etc. found in `package.json`).

### Database query shape

`getProductsForCategoryIds` and the admin dashboard both correctly use `Promise.all` to parallelize independent queries (e.g. `count` + `findMany` together) rather than awaiting them sequentially. Indexes exist on the FK columns that matter (`Product.categoryId`, `StockLevel.warehouseId`, `StockMovement.productId`/`warehouseId`/etc., `Notification.createdAt`) per `schema.prisma`'s `@@index` declarations.

### File storage on the request path

Not a request-time performance issue, but related: local-disk-based uploads (§12/§15) mean image delivery doesn't benefit from a CDN unless Render or a fronting proxy adds one — worth revisiting alongside the durability fix.

---

## 17. Quick-reference cheat sheet

**Common commands**
```bash
npm run dev            # local dev server
npm run build           # production build (requires DATABASE_URL to actually query at runtime, not at build time)
npm run start             # run the production build
npm run db:seed            # import scraped catalog data + create the OWNER account (prisma/seed.ts)
npx prisma studio            # visual DB browser
npx prisma migrate dev        # create+apply a new migration locally
npx prisma migrate deploy      # apply pending migrations to production DATABASE_URL (do this manually — not wired into the Render build)
npm run export-demo-data        # legacy script tied to the unused demo-store.ts — safe to ignore/remove
```

**Where to find things**
- Data access / business logic → `src/lib/*.ts`
- Admin mutations → `src/app/admin/(dashboard)/**/actions.ts`
- Public HTTP endpoints → `src/app/api/**`
- Auth/session internals → `src/lib/session*.ts`, `src/lib/rbac*.ts`
- UI copy → `messages/{uk,en,ru}.json`
- Product/category translatable content → the `Json` columns on `Product`/`Category` in the DB itself, not a messages file
- Theming tokens → `src/app/globals.css` (`--color-*`, `--shadow-*`)

**Role table (quick version)**

| | products | categories | orders | warehouses | media | homepage | reviews | seo | contacts | users |
|---|---|---|---|---|---|---|---|---|---|---|
| OWNER | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| MANAGER | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| WAREHOUSE | view | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| EMPLOYEE | view | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Env vars (minimum to run)**: `DATABASE_URL`, `SESSION_SECRET`. Everything else has a safe fallback (see §10).

**Before shipping this to real customers**, prioritize fixing the price-tampering issue in §15 — it's the one finding with direct financial impact.
