# 19 — Production Deployment & Ops Guide

## 1. Pre-Deployment Checklist

Before deploying to production (Vercel):

1. **Verify Local Production Build:**
   ```bash
   npx next build
   ```
   Confirm 0 linting or TypeScript compilation errors.

2. **Database Push (Supabase PostgreSQL):**
   ```bash
   npx prisma db push
   ```
   Ensure production database schema matches `prisma/schema.prisma`.

3. **Configure Environment Variables in Vercel:**
   Set the following variables in Vercel Project Settings:
   - `NODE_ENV=production`
   - `NEXT_PUBLIC_APP_URL=https://your-domain.com`
   - `DATABASE_URL=postgresql://...`
   - `NEXT_PUBLIC_SUPABASE_URL=https://...`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...`
   - `SUPABASE_SERVICE_ROLE_KEY=eyJ...`
   - `CLOUDINARY_CLOUD_NAME=...`
   - `CLOUDINARY_API_KEY=...`
   - `CLOUDINARY_API_SECRET=...`
   - `RAZORPAY_KEY_ID=rzp_live_...`
   - `RAZORPAY_KEY_SECRET=...`
   - `RAZORPAY_WEBHOOK_SECRET=...`
   - `MSG91_AUTH_KEY=...`

---

## 2. Deploy Command & Continuous Integration

Deploy via Vercel CLI or automatic GitHub push:

```bash
# Vercel Production Deployment
vercel --prod
```

---

## 3. Post-Deployment Verification

1. Access `https://your-domain.com/api/health` $\to$ Confirm `{ status: "ok" }`.
2. Test customer login & address manager at `/profile/addresses`.
3. Test Admin House Switcher at `/admin/designers`.
4. Perform a live test transaction via Razorpay gateway and verify webhook execution.
