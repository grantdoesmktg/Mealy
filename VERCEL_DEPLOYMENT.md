# Vercel Deployment Guide for Mealy

## Quick Setup (5 minutes)

### 1. Import Project to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repo: `grantdoesmktg/Mealy`
4. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/backend`
   - **Build Command:** Leave default (`next build`)
   - **Output Directory:** Leave default (`.next`)
   - **Install Command:** Leave default (`npm install`)

### 2. Set Environment Variables

Click "Environment Variables" and add these:

```bash
# Database (Supabase)
DATABASE_URL=postgresql://postgres:5kKJuT5mDv0rOWYi@db.xzjolnfqkqvrcuepokro.supabase.co:5432/postgres?sslmode=require

# Gemini AI
GEMINI_API_KEY=your-actual-gemini-key

# Stripe
STRIPE_SECRET_KEY=your-actual-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-actual-webhook-secret

# Stripe Price IDs
STRIPE_MONTHLY_PRICE_ID=price_1SXpWtBQhmgCTBhkQQMnrOK7
STRIPE_YEARLY_PRICE_ID=price_1SXpZXBQhmgCTBhk3S3sgRvF
```

**Important:** Make sure to use your **actual** API keys, not placeholders!

### 3. Deploy

Click "Deploy" - Vercel will:
- Install dependencies
- Build your Next.js app
- Deploy to production

### 4. Run Database Migrations

After deployment completes, you need to set up your Supabase database.

**Option A: Use Supabase SQL Editor** (Recommended)
1. Go to your Supabase project → SQL Editor
2. Copy the SQL from `SUPABASE_SETUP.md`
3. Run it

**Option B: Use Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Pull environment variables
vercel env pull .env.production

# Run migrations
cd apps/backend
DATABASE_URL="$(grep DATABASE_URL ../../.env.production | cut -d '=' -f2-)" npx prisma migrate deploy
```

### 5. Configure Stripe Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-app.vercel.app/api/subscriptions/webhook`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret
6. Add it to Vercel env vars as `STRIPE_WEBHOOK_SECRET`
7. Redeploy (Vercel Dashboard → Deployments → ... → Redeploy)

### 6. Test Your API

Visit: `https://your-app.vercel.app/api/auth/me`

You should see the test user data (or a 401 if migrations haven't run yet).

---

## Update Mobile App

Edit `apps/mobile/src/lib/api.ts`:

```typescript
const API_URL = __DEV__
  ? Platform.OS === 'android' 
    ? 'http://10.0.2.2:3000/api'
    : 'http://192.168.1.16:3000/api'
  : 'https://your-app.vercel.app/api' // Replace with your Vercel URL
```

---

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Ensure `Root Directory` is set to `apps/backend`
- Verify all env vars are set

### Database Connection Error
- Verify `DATABASE_URL` includes `?sslmode=require`
- Check Supabase project is active
- Ensure migrations have been run

### API Returns 500
- Check Vercel Function Logs
- Verify Prisma client is generated (should happen automatically)
- Ensure database tables exist

---

## Next Steps

1. ✅ Deploy backend to Vercel
2. ✅ Run database migrations
3. ✅ Configure Stripe webhook
4. 🔄 Update mobile app API URL
5. 🔄 Test end-to-end flow
6. 🔄 Add real authentication (Clerk/Auth0)
7. 🔄 Submit mobile app to App Store
