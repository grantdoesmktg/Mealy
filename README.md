# Mealy

Mealy is an iOS-first social meal planner app.

## Project Structure

- `apps/backend`: Next.js backend (API routes, Prisma, Auth, Stripe, Gemini).
- `apps/mobile`: Expo React Native app.
- `packages/types`: Shared TypeScript types.
- `packages/config`: Shared configuration.

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create `apps/backend/.env` with:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/mealy"
   GEMINI_API_KEY="your-gemini-key"
   STRIPE_SECRET_KEY="your-stripe-key"
   STRIPE_WEBHOOK_SECRET="your-webhook-secret"
   ```

3. **Database**:
   ```bash
   cd apps/backend
   npx prisma generate
   # npx prisma migrate dev (requires running Postgres)
   # npx ts-node prisma/seed.ts (to seed test data)
   ```

4. **Run Locally**:
   ```bash
   npm run dev
   ```
   This starts both backend (port 3000) and mobile (Expo).

## Features

- **Auth**: Mock auth for dev (header `x-mock-user-id`).
- **Groups**: Create/Join groups, invite via code.
- **Recipes**: Manual add or AI extraction (Gemini).
- **Planning**: Weekly meal planner.
- **Shopping Cart**: Auto-generated from plan.
- **Pantry**: Track items.
- **Subscription**: Stripe integration skeleton.

## Share Extension

The iOS Share Extension is stubbed in `apps/mobile/ios_stub/ShareViewController.swift`.
Deep linking is configured in `app.json` (`scheme: "mealy"`).
Test deep link: `mealy://share?url=https://example.com/recipe`
