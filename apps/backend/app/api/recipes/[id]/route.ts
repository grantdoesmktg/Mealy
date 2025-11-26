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

    const recipe = await prisma.recipe.findUnique({
        where: { id }
    })

    if (!recipe) {
        return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    // Check access (owner or group member)
    if (recipe.userId !== user.id) {
        if (recipe.groupId) {
            const isMember = await prisma.groupMember.findUnique({
                where: {
                    userId_groupId: {
                        userId: user.id,
                        groupId: recipe.groupId
                    }
                }
            })
            if (!isMember) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }
        } else {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
    }

    return NextResponse.json(recipe)
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()

    // Only owner can edit? Or group members?
    // Let's say only owner for now.
    const recipe = await prisma.recipe.findUnique({ where: { id } })
    if (!recipe || recipe.userId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await prisma.recipe.update({
        where: { id },
        data: {
            title: body.title,
            ingredients: body.ingredients,
            steps: body.steps,
            servings: body.servings,
            imageUrl: body.imageUrl,
            sourceUrl: body.sourceUrl
        }
    })

    return NextResponse.json(updated)
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const recipe = await prisma.recipe.findUnique({ where: { id } })
    if (!recipe || recipe.userId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.recipe.delete({ where: { id } })

    return NextResponse.json({ success: true })
}
