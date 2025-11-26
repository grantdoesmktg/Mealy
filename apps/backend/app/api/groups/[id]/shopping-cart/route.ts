import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { SubscriptionTier, IngredientCategory } from '@prisma/client'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (user.subscriptionTier === SubscriptionTier.FREE) {
        return NextResponse.json({ error: 'Shopping cart is a paid feature' }, { status: 403 })
    }

    const { id: groupId } = await params

    const isMember = await prisma.groupMember.findUnique({
        where: { userId_groupId: { userId: user.id, groupId } }
    })
    if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const cart = await prisma.shoppingCartItem.findMany({
        where: { groupId },
        orderBy: { category: 'asc' }
    })

    return NextResponse.json(cart)
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // Generate Cart
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (user.subscriptionTier === SubscriptionTier.FREE) {
        return NextResponse.json({ error: 'Shopping cart is a paid feature' }, { status: 403 })
    }

    const { id: groupId } = await params
    const body = await request.json()
    const { weekStartDate } = body // Generate from this week

    const isMember = await prisma.groupMember.findUnique({
        where: { userId_groupId: { userId: user.id, groupId } }
    })
    if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // 1. Get WeekPlan
    const weekPlan = await prisma.weekPlan.findUnique({
        where: {
            groupId_weekStartDate: {
                groupId,
                weekStartDate: new Date(weekStartDate)
            }
        },
        include: {
            assignments: {
                include: { recipe: true }
            }
        }
    })

    if (!weekPlan) {
        return NextResponse.json({ error: 'No plan found for this week' }, { status: 404 })
    }

    // 2. Aggregate ingredients
    // This is a simplified logic. Real logic would parse quantities and units.
    // For MVP, we just list them.
    const ingredients: { name: string; quantity: string; unit: string; category: IngredientCategory }[] = []

    weekPlan.assignments.forEach(assignment => {
        const recipeIngredients = assignment.recipe.ingredients as any[] // JSON
        if (Array.isArray(recipeIngredients)) {
            recipeIngredients.forEach(ing => {
                // Assume ing has { name, quantity, unit, category? }
                // If string, just use it as name
                if (typeof ing === 'string') {
                    ingredients.push({ name: ing, quantity: '1', unit: 'unit', category: IngredientCategory.MISC })
                } else {
                    ingredients.push({
                        name: ing.name || ing.ingredient || 'Unknown',
                        quantity: ing.quantity || '1',
                        unit: ing.unit || '',
                        category: IngredientCategory.MISC // TODO: Categorize
                    })
                }
            })
        }
    })

    // 3. Clear existing cart? Or merge?
    // PRD: "Regenerate from current WeekPlan" implies replacing or smart merging.
    // Let's clear and replace for simplicity of "Regenerate".
    await prisma.shoppingCartItem.deleteMany({ where: { groupId } })

    // 4. Create items
    await prisma.shoppingCartItem.createMany({
        data: ingredients.map(ing => ({
            groupId,
            ingredient: ing.name,
            quantity: String(ing.quantity),
            unit: ing.unit,
            category: ing.category
        }))
    })

    const newCart = await prisma.shoppingCartItem.findMany({ where: { groupId } })
    return NextResponse.json(newCart)
}
