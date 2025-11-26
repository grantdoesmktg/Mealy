# Supabase Database Setup Instructions

## Issue
Your local machine cannot connect to Supabase (DNS resolution failure). This is likely due to:
- Network/firewall restrictions
- VPN blocking the connection
- Local DNS configuration

## Solution: Run Migrations from Supabase Dashboard

### Option 1: Use Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Create a new query
4. Copy and paste the migration SQL below
5. Click "Run"

### Migration SQL

```sql
-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PAID');
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBER');
CREATE TYPE "MealSlot" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'DESSERT');
CREATE TYPE "IngredientCategory" AS ENUM ('PRODUCE', 'PROTEIN', 'DAIRY', 'DRY_GOODS', 'BAKING', 'SPICES', 'SNACKS', 'FROZEN', 'PANTRY', 'MISC');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "authId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "maxRecipesAllowed" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GroupMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT,
    "title" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "imageUrl" TEXT,
    "ingredients" JSONB NOT NULL,
    "steps" JSONB NOT NULL,
    "servings" INTEGER NOT NULL DEFAULT 4,
    "isAIExtracted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WeekPlan" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WeekPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WeekPlanMealAssignment" (
    "id" TEXT NOT NULL,
    "weekPlanId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "slot" "MealSlot" NOT NULL,
    "isLeftover" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "WeekPlanMealAssignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShoppingCartItem" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "ingredient" TEXT NOT NULL,
    "quantity" TEXT,
    "unit" TEXT,
    "category" "IngredientCategory" NOT NULL DEFAULT 'MISC',
    "checkedOff" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ShoppingCartItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PantryItem" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "ingredient" TEXT NOT NULL,
    "quantity" TEXT,
    "unit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PantryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_authId_key" ON "User"("authId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "GroupMember_userId_groupId_key" ON "GroupMember"("userId", "groupId");
CREATE UNIQUE INDEX "WeekPlan_groupId_weekStartDate_key" ON "WeekPlan"("groupId", "weekStartDate");
CREATE INDEX "WeekPlanMealAssignment_weekPlanId_idx" ON "WeekPlanMealAssignment"("weekPlanId");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WeekPlan" ADD CONSTRAINT "WeekPlan_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WeekPlanMealAssignment" ADD CONSTRAINT "WeekPlanMealAssignment_weekPlanId_fkey" FOREIGN KEY ("weekPlanId") REFERENCES "WeekPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WeekPlanMealAssignment" ADD CONSTRAINT "WeekPlanMealAssignment_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ShoppingCartItem" ADD CONSTRAINT "ShoppingCartItem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PantryItem" ADD CONSTRAINT "PantryItem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed Data
INSERT INTO "User" ("id", "authId", "email", "name", "subscriptionTier", "maxRecipesAllowed", "createdAt", "updatedAt")
VALUES ('test-user-id', 'test-auth-id', 'test@example.com', 'Test User', 'PAID', 50, NOW(), NOW());

INSERT INTO "Group" ("id", "name", "createdByUserId", "createdAt", "updatedAt")
VALUES ('test-group-id', 'Test Family', 'test-user-id', NOW(), NOW());

INSERT INTO "GroupMember" ("id", "userId", "groupId", "role", "joinedAt")
VALUES ('test-member-id', 'test-user-id', 'test-group-id', 'ADMIN', NOW());
```

### Option 2: Deploy to Vercel First

Alternatively, you can:
1. Push your code to GitHub
2. Deploy to Vercel
3. Vercel will automatically run migrations on deploy

## After Migration

Once the tables are created, update your local `.env` file with your actual API keys:

```bash
# Edit apps/backend/.env
GEMINI_API_KEY="your-actual-gemini-key"
STRIPE_SECRET_KEY="your-actual-stripe-key"
STRIPE_WEBHOOK_SECRET="your-actual-webhook-secret"
```

Then restart your backend:
```bash
npm run backend
```
