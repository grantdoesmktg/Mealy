import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { Role } from '@prisma/client'

export async function GET(request: Request) {
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const groups = await prisma.group.findMany({
        where: {
            members: {
                some: {
                    userId: user.id
                }
            }
        },
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

    return NextResponse.json(groups)
}

export async function POST(request: Request) {
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const body = await request.json()
        const { name } = body

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        const group = await prisma.group.create({
            data: {
                name,
                createdByUserId: user.id,
                members: {
                    create: {
                        userId: user.id,
                        role: Role.ADMIN
                    }
                }
            }
        })

        return NextResponse.json(group)
    } catch (error) {
        console.error('Error creating group:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
