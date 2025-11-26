import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const group = await prisma.group.findUnique({
        where: { id },
        include: { members: true }
    })

    if (!group) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const isMember = group.members.some(m => m.userId === user.id)
    if (!isMember) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Simple insecure invite code for MVP: base64 of groupId
    const inviteCode = Buffer.from(group.id).toString('base64')

    return NextResponse.json({ inviteCode })
}
