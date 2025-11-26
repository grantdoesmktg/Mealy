# Mealy Deployment Guide

## Environment Variables

### Required for Local Development

Create `apps/backend/.env`:

```bash
# Database (Local PostgreSQL)
DATABASE_URL="postgresql://mealy:mealy@localhost:5432/mealy"

# Gemini AI (Get from: https://aistudio.google.com/app/apikey)
GEMINI_API_KEY="your-gemini-api-key"

# Stripe (Get from: https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY="sk_test_..." # Use test key for development
STRIPE_WEBHOOK_SECRET="whsec_..." # From Stripe CLI or webhook settings

# Auth (Optional - for production with Clerk/Auth0)
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
# CLERK_SECRET_KEY="sk_test_..."
```

### Required for Vercel Production

Set these in your Vercel project settings (Settings → Environment Variables):

#### Database
```
DATABASE_URL=postgresql://user:password@host:5432/database
```
**Options:**
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (recommended, auto-configured)
- [Neon](https://neon.tech) (free tier available)
- [Supabase](https://supabase.com) (free tier available)

#### AI Service
```
GEMINI_API_KEY=your-production-gemini-key
```
Get from: https://aistudio.google.com/app/apikey

#### Payment Processing
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
Get from: https://dashboard.stripe.com/apikeys

**Important:** Use **live** keys for production, not test keys.

#### Authentication (When Ready)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```
Or for Auth0:
```
AUTH0_SECRET=...
AUTH0_BASE_URL=https://your-domain.vercel.app
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
```

---

## GitHub Setup

### 1. Initialize Git Repository

```bash
cd /Users/mystuff/Documents/Mealy
git init
git add .
git commit -m "Initial commit: Mealy MVP"
```

### 2. Create GitHub Repository

1. Go to https://github.com/new
2. Name: `mealy` (or your preferred name)
3. **Do NOT** initialize with README (we already have one)
4. Click "Create repository"

### 3. Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/mealy.git
git branch -M main
git push -u origin main
```

---

## Vercel Deployment

### 1. Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2. Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. **Framework Preset:** Next.js
4. **Root Directory:** `apps/backend`
5. **Build Command:** `npm run build`
6. **Output Directory:** `.next`
7. Click "Deploy"

### 3. Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add all the production variables listed above.

### 4. Set Up Database

**Option A: Vercel Postgres (Easiest)**
1. In Vercel Dashboard → Storage → Create Database → Postgres
2. This auto-configures `DATABASE_URL`
3. Run migrations:
   ```bash
   vercel env pull .env.local
   cd apps/backend
   npx prisma migrate deploy
   npx prisma db seed
   ```

**Option B: External Provider (Neon/Supabase)**
1. Create database on provider
2. Copy connection string
3. Add as `DATABASE_URL` in Vercel
4. Run migrations from local:
   ```bash
   DATABASE_URL="your-production-url" npx prisma migrate deploy
   DATABASE_URL="your-production-url" npx prisma db seed
   ```

### 5. Configure Stripe Webhooks

1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://your-app.vercel.app/api/subscriptions/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook secret to Vercel env vars

---

## Mobile App Configuration

### Update API URL for Production

Edit `apps/mobile/src/lib/api.ts`:

```typescript
const API_URL = __DEV__
  ? Platform.OS === 'android' 
    ? 'http://10.0.2.2:3000/api'
    : 'http://192.168.1.16:3000/api'
  : 'https://your-app.vercel.app/api' // Your production URL
```

### Build for iOS

```bash
cd apps/mobile
eas build --platform ios
```

---

## Post-Deployment Checklist

- [ ] Database is provisioned and migrations are run
- [ ] All environment variables are set in Vercel
- [ ] Stripe webhook is configured and pointing to production
- [ ] Test user can log in via mobile app (pointing to production API)
- [ ] Create a test recipe
- [ ] Create a test group
- [ ] Verify subscription flow (if Stripe is configured)

---

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if database allows connections from Vercel IPs
- Ensure SSL is enabled if required: `?sslmode=require`

### Prisma Client Errors
- Run `npx prisma generate` after schema changes
- Redeploy to Vercel to pick up new client

### Stripe Webhook Failures
- Check webhook secret matches Vercel env var
- Verify endpoint URL is correct
- Check Stripe dashboard for delivery attempts

---

## Next Steps

1. **Authentication:** Replace mock auth with Clerk or Auth0
2. **Mobile App:** Submit to App Store Connect
3. **Monitoring:** Set up Sentry or Vercel Analytics
4. **Email:** Configure SendGrid/Resend for notifications
