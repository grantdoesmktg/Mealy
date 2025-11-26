import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { SubscriptionTier } from '@prisma/client'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: groupId } = await params
    const { searchParams } = new URL(request.url)
    const weekStartDate = searchParams.get('weekStartDate')

    if (!weekStartDate) {
        return NextResponse.json({ error: 'weekStartDate required' }, { status: 400 })
    }

    // Check membership
    const isMember = await prisma.groupMember.findUnique({
        where: { userId_groupId: { userId: user.id, groupId } }
    })
    if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Check subscription (WeekPlan is paid only?)
    // PRD: "Free: No weekly planner OR allow minimal read-only."
    // Let's allow read for everyone, write for paid?
    // Or just enforce Paid for the feature as per "Subscription / Tier Gating" section:
    // "PAID: Weekly planner enabled."
    // "FREE: No weekly planner."
    if (user.subscriptionTier === SubscriptionTier.FREE) {
        return NextResponse.json({ error: 'Weekly planner is a paid feature' }, { status: 403 })
    }

    const weekPlan = await prisma.weekPlan.findUnique({
        where: {
            groupId_weekStartDate: {
                groupId,
                weekStartDate: new Date(weekStartDate)
            }
        },
        include: {
            assignments: {
                include: {
                    recipe: {
                        select: { id: true, title: true, imageUrl: true, servings: true }
                    }
                }
            }
        }
    })

    return NextResponse.json(weekPlan || { assignments: [] })
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (user.subscriptionTier === SubscriptionTier.FREE) {
        return NextResponse.json({ error: 'Weekly planner is a paid feature' }, { status: 403 })
    }

    const { id: groupId } = await params
    const body = await request.json()
    const { weekStartDate, assignments } = body

    // Check membership
    const isMember = await prisma.groupMember.findUnique({
        where: { userId_groupId: { userId: user.id, groupId } }
    })
    if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Upsert WeekPlan
    const weekPlan = await prisma.weekPlan.upsert({
        where: {
            groupId_weekStartDate: {
                groupId,
                weekStartDate: new Date(weekStartDate)
            }
        },
        update: {},
        create: {
            groupId,
            weekStartDate: new Date(weekStartDate)
        }
    })

    // Replace assignments
    // Transaction: delete existing for this plan, create new
    await prisma.$transaction([
        prisma.weekPlanMealAssignment.deleteMany({
            where: { weekPlanId: weekPlan.id }
        }),
        prisma.weekPlanMealAssignment.createMany({
            data: assignments.map((a: any) => ({
                weekPlanId: weekPlan.id,
                recipeId: a.recipeId,
                day: a.day,
                slot: a.slot,
                isLeftover: a.isLeftover || false
            }))
        })
    ])

    // Return updated plan
    const updatedPlan = await prisma.weekPlan.findUnique({
        where: { id: weekPlan.id },
        include: {
            assignments: {
                include: {
                    recipe: {
                        select: { id: true, title: true, imageUrl: true, servings: true }
                    }
                }
            }
        }
    })

    return NextResponse.json(updatedPlan)
}
