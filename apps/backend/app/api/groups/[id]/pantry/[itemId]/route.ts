import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string; itemId: string }> }
) {
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: groupId, itemId } = await params
    const body = await request.json()

    const isMember = await prisma.groupMember.findUnique({
        where: { userId_groupId: { userId: user.id, groupId } }
    })
    if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const updated = await prisma.pantryItem.update({
        where: { id: itemId },
        data: {
            quantity: body.quantity,
            unit: body.unit
        }
    })

    return NextResponse.json(updated)
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string; itemId: string }> }
) {
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: groupId, itemId } = await params

    const isMember = await prisma.groupMember.findUnique({
        where: { userId_groupId: { userId: user.id, groupId } }
    })
    if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await prisma.pantryItem.delete({
        where: { id: itemId }
    })

    return NextResponse.json({ success: true })
}
