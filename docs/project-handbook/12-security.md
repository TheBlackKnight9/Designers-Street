# 12 — Security, Auth & Permissions

## 1. Authentication Engine

Authentication is managed via **Supabase Auth** integrated into Next.js App Router cookies (`@supabase/ssr`).
- **Auth Methods:** Email/Password and Google OAuth.
- **Session Lifecycle:** Cookies are automatically refreshed on every request via `updateSession(request)` in `src/middleware.ts`.

---

## 2. Role-Based Access Control (RBAC)

The application enforces a **2-Role Security Architecture**:

| Role | Access Scope |
|:---|:---|
| `buyer` | Customer storefront, saved addresses, measurement profiles, cart, checkout, order history |
| `admin` | Full access to `/admin/*`, `/dashboard/*`, multi-house switcher, payouts, catalog management |

### Middleware Gating Logic (`src/lib/supabase/middleware.ts`):
- `/admin/*` routes require a valid session with `user.role === 'admin'`. Unauthenticated users are redirected to `/account/login`.
- `/dashboard/*` routes allow access if `user.role === 'admin'` OR if `admin_active_designer_id` cookie is present.

---

## 3. API Security & Data Isolation

- **Server-Side Validation:** Inputs parsed using type assertions and sanitized before database writes.
- **Webhook Security:** Razorpay webhook handler (`/api/webhooks/razorpay`) verifies HMAC SHA256 signatures using `RAZORPAY_WEBHOOK_SECRET`.
- **SQL Injection Prevention:** All database operations utilize Prisma ORM parameterized queries.
- **Media Upload Security:** Server-side upload stream handles credentials securely, never exposing Cloudinary API secrets to the client browser.
