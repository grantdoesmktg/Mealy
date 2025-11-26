import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import Stripe from 'stripe'

// Initialize Stripe (mock or real)
const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-11-17.clover' as any }) // Explicit cast to avoid future mismatch if types change
    : null

export async function POST(request: Request) {
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!stripe) {
        // Mock mode
        return NextResponse.json({ url: 'http://localhost:3000/mock-checkout?success=true' })
    }

    try {
        const { priceId } = await request.json()

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer_email: user.email,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${request.headers.get('origin')}/settings?success=true`,
            cancel_url: `${request.headers.get('origin')}/settings?canceled=true`,
            metadata: {
                userId: user.id
            }
        })

        return NextResponse.json({ url: session.url })
    } catch (err: any) {
        console.error(err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
