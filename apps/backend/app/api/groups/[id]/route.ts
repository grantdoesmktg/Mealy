import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const group = await prisma.group.findUnique({
        where: { id },
        include: {
            members: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true }
                    }
                }
            }
        }
    })

    if (!group) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Check membership
    const isMember = group.members.some(m => m.userId === user.id)
    if (!isMember) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(group)
}
