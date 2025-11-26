import { PrismaClient, Role, SubscriptionTier } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // Create a test user
    const user = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
            email: 'test@example.com',
            authId: 'test-auth-id',
            name: 'Test User',
            subscriptionTier: SubscriptionTier.PAID,
            maxRecipesAllowed: 50,
        },
    })

    console.log({ user })

    // Create a group
    const group = await prisma.group.create({
        data: {
            name: 'Test Family',
            createdByUserId: user.id,
            members: {
                create: {
                    userId: user.id,
                    role: Role.ADMIN,
                },
            },
        },
    })

    console.log({ group })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
