import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { Role } from '@prisma/client'

export async function POST(request: Request) {
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { inviteCode } = await request.json()

        if (!inviteCode) {
            return NextResponse.json({ error: 'Invite code required' }, { status: 400 })
        }

        // Decode base64
        const groupId = Buffer.from(inviteCode, 'base64').toString('utf-8')

        const group = await prisma.group.findUnique({
            where: { id: groupId }
        })

        if (!group) {
            return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })
        }

        // Check if already member
        const existingMember = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: user.id,
                    groupId: group.id
                }
            }
        })

        if (existingMember) {
            return NextResponse.json({ message: 'Already a member', group })
        }

        // Add member
        await prisma.groupMember.create({
            data: {
                userId: user.id,
                groupId: group.id,
                role: Role.MEMBER
            }
        })

        return NextResponse.json({ message: 'Joined group successfully', group })

    } catch (error) {
        console.error('Error joining group:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
