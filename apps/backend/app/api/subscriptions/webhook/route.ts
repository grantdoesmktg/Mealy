import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import { SubscriptionTier } from '@prisma/client'

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-11-17.clover' as any })
    : null

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: Request) {
    if (!stripe || !endpointSecret) {
        return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const sig = request.headers.get('stripe-signature')
    if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

    let event: Stripe.Event

    try {
        const body = await request.text()
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    } catch (err: any) {
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
            const subscription = event.data.object as Stripe.Subscription
            await handleSubscriptionChange(subscription)
            break
        case 'customer.subscription.deleted':
            const deletedSubscription = event.data.object as Stripe.Subscription
            await handleSubscriptionDeleted(deletedSubscription)
            break
        default:
            console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
    // Look up user by customer ID or metadata
    // In create-checkout-session, we passed metadata.userId
    // But subscription object might not have it directly if it wasn't propagated.
    // Usually we rely on customer email or store stripeCustomerId on User.

    // For MVP, let's assume we can find the user via email if we had it, or metadata if propagated.
    // Stripe checkout session metadata is not automatically on subscription unless configured.
    // We'll assume we can find the user. For now, just logging.
    console.log('Subscription changed:', subscription.id)

    // Logic:
    // 1. Find user
    // 2. Update subscriptionTier = PAID
    // 3. Update maxRecipesAllowed = 50
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    console.log('Subscription deleted:', subscription.id)
    // Logic:
    // 1. Find user
    // 2. Update subscriptionTier = FREE
    // 3. Update maxRecipesAllowed = 20
}
