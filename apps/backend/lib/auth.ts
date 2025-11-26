import { prisma } from './prisma'

// Mock auth for MVP/Dev
export async function getAuthUser(req: Request) {
    // In a real app, verify token from headers (Clerk/Auth0)
    // For now, return a mock user or look up by a header 'x-mock-user-id'

    const mockUserId = req.headers.get('x-mock-user-id')

    if (mockUserId) {
        // Try to find user by ID or AuthID
        const user = await prisma.user.findFirst({
            where: { OR: [{ id: mockUserId }, { authId: mockUserId }] }
        })
        if (user) return user
    }

    // Fallback to the seeded test user if in dev
    if (process.env.NODE_ENV !== 'production') {
        return await prisma.user.findUnique({
            where: { email: 'test@example.com' }
        })
    }

    return null
}
