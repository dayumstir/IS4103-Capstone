import { prisma } from "./db";


// Create email verification token and associate it with a customer
export const createToken = async (email: string, token: string, expiresAt: Date, customer_id: string) => {
    await prisma.emailVerificationToken.create({
        data: {
            email,
            token,
            expiresAt,
            customer_id,
        }
    });
};


// Find a token by its value
export const findToken = async (token: string) => {
    return prisma.emailVerificationToken.findUnique({ 
        where: { 
            token,
            expiresAt: { gt: new Date() },  // Check that it is not expired
            used: false,                    // Ensure that it has not been used
        } 
    });
};


// Mark token as used after successful verification
export const markTokenAsUsed = async (token: string) => {
    await prisma.emailVerificationToken.update({
        where: { token },
        data: { used: true },
    });
};


// Invalidate all previous tokens for the given email
export const invalidateTokensByEmail = async (email: string) => {
    await prisma.emailVerificationToken.updateMany({
        where: { email },
        data: { used: true },  // Mark all previous tokens as "used"
    });
};
