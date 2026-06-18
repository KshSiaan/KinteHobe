# KinteHobe — Route Map

Use this file to answer questions about navigation, linking, access control, and API endpoints.

---

## Base URL

https://kintehobe.vercel.app

## Route Groups (Next.js App Router)

| Group folder | URL prefix | Auth requirement |
|---|---|---|
| `(view)` | `/` | Public |
| `(view)/(protected)` | `/people`, `/user/[id]`, `/khuki` | Session required |
| `(me)` | `/me/**` | Session required (enforced by ProfileSidebar/API) |
| `auth` | `/auth/**` | Guest only (redirect if already authed) |
| `admin/(view)` | `/admin/**` | Admin role (`role === "admin"`) |

---

## Public Pages

| URL | File | Notes |
|---|---|---|
| `/` | `src/app/(view)/page.tsx` | Home — hero, categories, daily discover |
| `/categories` | `src/app/(view)/categories/page.tsx` | All categories listing |
| `/categories/[slug]` | `src/app/(view)/categories/[slug]/page.tsx` | Products in a category |
| `/product/[slug]` | `src/app/(view)/product/[slug]/page.tsx` | Product detail, reviews, share |
| `/cart` | `src/app/(view)/cart/page.tsx` | Shopping cart |
| `/checkout` | `src/app/(view)/checkout/page.tsx` | Checkout flow (3-step) |
| `/order/success` | `src/app/(view)/order/success/page.tsx` | Post-purchase success |
| `/order/cancel` | `src/app/(view)/order/cancel/page.tsx` | Payment cancelled |

---

## Auth Pages

| URL | File | Notes |
|---|---|---|
| `/auth/login` | `src/app/auth/login/page.tsx` | Login form |
| `/auth/register` | `src/app/auth/register/page.tsx` | Registration form |

---

## Protected Pages (session required → shows `<UnAuth />` if no session)

| URL | File | Notes |
|---|---|---|
| `/people` | `src/app/(view)/(protected)/people/page.tsx` | Social — everyone / friends / requests tabs |
| `/user/[id]` | `src/app/(view)/(protected)/user/[id]/page.tsx` | Another user's public profile |
| `/khuki` | `src/app/(view)/(protected)/khuki/page.tsx` | AI chat assistant |

---

## "Me" Pages (own profile — `/me/**`)

| URL | File | Notes |
|---|---|---|
| `/me` | `src/app/(me)/me/page.tsx` | Profile dashboard — activity / purchases / insights / saved |
| `/me/settings` | `src/app/(me)/me/settings/page.tsx` | Settings — general / security / appearance / agent |
| `/me/orders` | `src/app/(me)/me/orders/page.tsx` | Order history |

---

## Admin Pages (role === "admin" required → 404 otherwise)

| URL | File | Notes |
|---|---|---|
| `/admin/dashboard` | `src/app/admin/(view)/dashboard/page.tsx` | Admin overview |
| `/admin/dashboard/banners` | `…/banners/page.tsx` | Banner management |
| `/admin/dashboard/categories` | `…/categories/page.tsx` | Category CRUD |
| `/admin/dashboard/products` | `…/products/page.tsx` | Products list |
| `/admin/dashboard/products/add` | `…/products/add/page.tsx` | Add product wizard |
| `/admin/dashboard/managers` | `…/managers/page.tsx` | Manager accounts |
| `/admin/dashboard/users` | `…/users/page.tsx` | All users |
| `/admin/dashboard/users/[id]` | `…/users/[id]/page.tsx` | User detail — ban / role / impersonate |
| `/admin/dashboard/orders` | `…/orders/page.tsx` | Orders list |
| `/admin/dashboard/transactions` | `…/transactions/page.tsx` | Transactions |
| `/admin/dashboard/coupons` | `…/coupons/page.tsx` | Coupons |
| `/admin/dashboard/tools/draw` | `…/tools/draw/page.tsx` | Drawing tool |
| `/admin/dashboard/tools/kanban` | `…/tools/kanban/page.tsx` | Kanban board |
| `/admin/dashboard/tools/notepad` | `…/tools/notepad/page.tsx` | Notes |

---

## API Routes

### Auth
| Endpoint | File | Notes |
|---|---|---|
| `/api/auth/[...all]` | `src/app/api/auth/[...all]/route.ts` | better-auth handler — all auth operations |

### Public / Client
| Endpoint | Method(s) | Notes |
|---|---|---|
| `/api/banner` | GET | Active banners for home hero |
| `/api/category` | GET | All categories |
| `/api/category/[id]` | GET | Single category by DB id |
| `/api/client/category` | GET | Client-facing categories |
| `/api/client/category/[slug]` | GET | Client category by slug |
| `/api/product` | GET | Products listing (supports filters) |
| `/api/product/[slug]` | GET | Product detail by slug |
| `/api/review` | POST | Submit review (auth required) |
| `/api/review/[slug]` | GET | Reviews for a product |

### Social / Follow
| Endpoint | Method(s) | Notes |
|---|---|---|
| `/api/people` | GET | All users (for People page) |
| `/api/follow` | POST | Send follow request |
| `/api/follow/[id]` | GET/DELETE | Accept / decline / remove follow |
| `/api/follow/pending` | GET | Incoming follow requests |
| `/api/follow/status/[userId]` | GET | Follow status with a user |
| `/api/follow/friends` | GET | Confirmed friends list |

### Commerce
| Endpoint | Method(s) | Notes |
|---|---|---|
| `/api/order` | GET/POST | List orders / place order |
| `/api/order/confirm` | POST | Confirm payment (webhook/callback) |
| `/api/wish` | GET/POST/DELETE | Wishlist single item |
| `/api/wish/all` | GET | Full wishlist |

### AI
| Endpoint | Method(s) | Notes |
|---|---|---|
| `/api/chat` | POST | Khuki AI chat — streaming response |

### Admin (admin role required)
| Endpoint | Method(s) | Notes |
|---|---|---|
| `/api/admin/banner` | GET/POST/DELETE | Banner CRUD |
| `/api/admin/category` | GET/POST | Category list / create |
| `/api/admin/category/[id]` | PATCH/DELETE | Update / delete category |
| `/api/manage/product` | POST/PATCH/DELETE | Product management |
| `/api/admin/orders` | GET | All orders |
| `/api/admin/transactions` | GET | All transactions |

---

## Auth System

- Library: **better-auth** (`src/lib/auth.ts`)
- Session check: `auth.api.getSession({ headers })`
- Roles: `user` (default), `admin`
- Protected layout: `src/app/(view)/(protected)/layout.tsx` — renders `<UnAuth />` if no session
- Admin layout: `src/app/admin/(view)/layout.tsx` — returns `notFound()` if role !== "admin"

---

## Key Linking Patterns

```tsx
// Product page
href={`/product/${product.slug}`}

// Category page
href={`/categories/${category.slug}`}

// User profile
href={`/user/${user.id}`}

// Admin user detail
href={`/admin/dashboard/users/${user.id}`}

// Cart
href="/cart"

// Checkout
href="/checkout"

// Login
href="/auth/login"

// Register
href="/auth/register"

// Own profile
href="/me"

// Settings
href="/me/settings"

// People / social
href="/people"

// AI chat
href="/khuki"
```

---

## Layout Hierarchy

```
app/layout.tsx                    (root — theme, fonts)
├── (view)/layout.tsx             (Navbar + Footer)
│   ├── page.tsx                  → /
│   ├── categories/...            → /categories/**
│   ├── product/[slug]/...        → /product/[slug]
│   ├── cart/...                  → /cart
│   ├── checkout/...              → /checkout
│   ├── order/...                 → /order/**
│   └── (protected)/layout.tsx   (auth gate)
│       ├── people/...            → /people
│       ├── user/[id]/...         → /user/[id]
│       └── khuki/...             → /khuki
├── (me)/layout.tsx               (Navbar + ProfileSidebar + Footer)
│   └── me/...                    → /me/**
├── auth/layout.tsx               (minimal — no navbar)
│   ├── login/...                 → /auth/login
│   └── register/...             → /auth/register
└── admin/(view)/layout.tsx       (admin role gate + AppSidebar)
    └── dashboard/...             → /admin/dashboard/**
```