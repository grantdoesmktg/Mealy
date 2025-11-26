import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'


export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (user.subscriptionTier === 'FREE') {
        return NextResponse.json({ error: 'Pantry is a paid feature' }, { status: 403 })
    }

    const { id: groupId } = await params

    const isMember = await prisma.groupMember.findUnique({
        where: { userId_groupId: { userId: user.id, groupId } }
    })
    if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const pantry = await prisma.pantryItem.findMany({
        where: { groupId },
        orderBy: { ingredient: 'asc' }
    })

    return NextResponse.json(pantry)
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (user.subscriptionTier === 'FREE') {
        return NextResponse.json({ error: 'Pantry is a paid feature' }, { status: 403 })
    }

    const { id: groupId } = await params
    const body = await request.json()
    const { ingredient, quantity, unit } = body

    const isMember = await prisma.groupMember.findUnique({
        where: { userId_groupId: { userId: user.id, groupId } }
    })
    if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const item = await prisma.pantryItem.create({
        data: {
            groupId,
            ingredient,
            quantity,
            unit
        }
    })

    return NextResponse.json(item)
}
