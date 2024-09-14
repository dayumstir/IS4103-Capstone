import { prisma } from "./db";


// Create token and associate it with a customer email
export const createToken = async (email: string, token: string) => {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)    // Token expires in 24hrs

    await prisma.emailVerificationToken.create({
        data: {
            token: token,
            expiresAt: expiresAt,
            email: email,
        }
    });
};


// Find a token by its value
export const findToken = async (token: string) => {
    return prisma.emailVerificationToken.findUnique({ 
        where: { token } 
    });
};


// Mark token as used after successful verification
export const markTokenAsUsed = async (token: string) => {
    await prisma.emailVerificationToken.update({
        where: { token },
        data: { used: true },
    });
};