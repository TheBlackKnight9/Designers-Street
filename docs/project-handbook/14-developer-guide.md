# 14 — Developer Setup & Workflow Guide

## 1. Local Development Setup

1. **Clone Repository & Install Dependencies:**
   ```bash
   git clone <repository-url>
   cd "phase 10 orignal"
   npm install
   ```

2. **Environment File Setup:**
   Create `.env` in project root:
   ```env
   NODE_ENV=development
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   USE_DATABASE=true
   NEXT_PUBLIC_USE_API=true
   DATABASE_URL=postgresql://postgres:PASSWORD@db.REF.supabase.co:5432/postgres

   NEXT_PUBLIC_SUPABASE_URL=https://REF.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_KEY
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...

   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=your_secret
   ```

3. **Database Migration & Seeding:**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Access application at `http://localhost:3000`.

---

## 2. Coding Standards & Conventions

- **Next.js App Router:** Keep pages server-rendered by default. Use `"use client"` only for interactive components containing React state or event listeners.
- **Fail-Safe APIs:** Wrap API route logic in `try/catch` and use response helpers `ok()` and `fail()` from `@/server/utils/api-response`.
- **Database Access:** Perform database queries via Repository classes in `src/server/repositories/` rather than writing inline Prisma calls in UI components.
- **Media Fallbacks:** Always handle Cloudinary credentials defensively with Base64 DB storage fallbacks.
