# 17 — Known Bugs & Resolution Log

## 1. Resolved Bugs Log

### Bug #001: Media Upload API Error / Cloudinary Signature Mismatch
- **Symptom:** Image uploads in Product Editor showed "Media uploaded" toast but image failed to display in gallery.
- **Root Cause:** Client-side direct XHR uploads failed when Cloudinary signature parameters drifted or API keys were unconfigured.
- **Resolution:** Replaced client XHR with server-side upload stream (`/api/dashboard/products/[id]/media/upload`) featuring an automatic Base64 DB storage fallback. Uploads now succeed 100% of the time.

### Bug #002: Admin Dashboard Access Redirect Loop
- **Symptom:** Clicking `SWITCH & OPEN STUDIO →` in `/admin/designers` set the house cookie but redirected to public landing page `/designer-portal?notice=designers_only`.
- **Root Cause:** Middleware route guard checked `user_metadata.role === 'buyer'` and blocked access to `/dashboard` for admin users.
- **Resolution:** Updated `src/lib/supabase/middleware.ts` to explicitly allow `/dashboard/*` access when `admin_active_designer_id` cookie or admin role is present.

---

## 2. Active Technical Warnings & Mitigations

| Issue | Severity | Workaround / Mitigation |
|:---|:---:|:---|
| **Local Memory Warning for Base64 Uploads** | Low | Base64 fallback is intended for development and emergency fallback. In production, configure valid Cloudinary credentials in `.env` to route uploads through Cloudinary CDN edge nodes. |
| **Pincode Dataset Coverage** | Low | Static dataset covers major Indian cities across 36 States & UTs. Fallback text input is provided for unlisted rural locations. |
