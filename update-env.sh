#!/bin/bash
# Script to update .env file with production credentials

ENV_FILE="apps/backend/.env"

cat > "$ENV_FILE" << 'EOF'
# Database - Supabase Production
DATABASE_URL="postgresql://postgres:5kKJuT5mDv0rOWYi@db.xzjolnfqkqvrcuepokro.supabase.co:5432/postgres"

# Gemini AI (Replace with your actual key)
GEMINI_API_KEY="YOUR_GEMINI_KEY_HERE"

# Stripe (Replace with your actual keys)
STRIPE_SECRET_KEY="YOUR_STRIPE_SECRET_KEY_HERE"
STRIPE_WEBHOOK_SECRET="YOUR_STRIPE_WEBHOOK_SECRET_HERE"

# Stripe Price IDs
STRIPE_MONTHLY_PRICE_ID="price_1SXpWtBQhmgCTBhkQQMnrOK7"
STRIPE_YEARLY_PRICE_ID="price_1SXpZXBQhmgCTBhk3S3sgRvF"

# Auth (Mock for now)
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
# CLERK_SECRET_KEY="sk_test_..."
EOF

echo "✅ .env file updated at $ENV_FILE"
echo ""
echo "⚠️  IMPORTANT: You still need to replace:"
echo "   - YOUR_GEMINI_KEY_HERE with your actual Gemini API key"
echo "   - YOUR_STRIPE_SECRET_KEY_HERE with your actual Stripe secret key"
echo "   - YOUR_STRIPE_WEBHOOK_SECRET_HERE with your Stripe webhook secret"
