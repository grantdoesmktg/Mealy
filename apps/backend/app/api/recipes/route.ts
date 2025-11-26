import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: Request) {
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')

    const where: any = {
        userId: user.id
    }

    if (groupId) {
        // If groupId is provided, also include recipes shared with that group
        // OR maybe just recipes created by user?
        // PRD says: "list user’s recipes, with optional group filter"
        // If recipe has groupId, it belongs to group? Or is it just shared?
        // Schema: Recipe has optional groupId.
        where.OR = [
            { userId: user.id },
            { groupId: groupId }
        ]
    }

    const recipes = await prisma.recipe.findMany({
        where,
        orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(recipes)
}

export async function POST(request: Request) {
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const body = await request.json()
        let { title, ingredients, steps, servings, sourceUrl, imageUrl, useAI, groupId } = body

        // Check limits
        const count = await prisma.recipe.count({ where: { userId: user.id } })
        if (count >= user.maxRecipesAllowed) {
            return NextResponse.json({ error: 'Recipe limit reached' }, { status: 403 })
        }

        if (useAI) {
            if (user.subscriptionTier === 'FREE') {
                return NextResponse.json({ error: 'AI features require paid subscription' }, { status: 403 })
            }

            let extractedData = null
            if (sourceUrl) {
                const { extractRecipeFromUrl } = await import('@/lib/ai/recipeExtractor')
                extractedData = await extractRecipeFromUrl(sourceUrl)
            } else if (body.rawText) {
                const { extractRecipeFromText } = await import('@/lib/ai/recipeExtractor')
                extractedData = await extractRecipeFromText(body.rawText)
            }

            if (extractedData) {
                // Merge extracted data with provided data (or use extracted as base)
                // We'll use extracted data but allow overrides if provided in body (though body usually just has URL if useAI is true)
                // For MVP, assume extracted data takes precedence for fields it found
                title = extractedData.title || title
                ingredients = extractedData.ingredients || ingredients
                steps = extractedData.steps || steps
                servings = extractedData.servings || servings
                imageUrl = extractedData.imageUrl || imageUrl
            }
        }

        const recipe = await prisma.recipe.create({
            data: {
                userId: user.id,
                groupId,
                title: title || 'Untitled Recipe',
                sourceUrl,
                imageUrl,
                ingredients: ingredients || [],
                steps: steps || [],
                servings: servings || 4,
                isAIExtracted: !!useAI
            }
        })

        return NextResponse.json(recipe)
    } catch (error) {
        console.error('Error creating recipe:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
