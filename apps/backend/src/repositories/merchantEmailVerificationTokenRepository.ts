import { prisma } from "./db";

// Create email verification token and associate it with a customer
export const createToken = async (
    email: string,
    token: string,
    expiresAt: Date,
    merchant_id: string
) => {
    await prisma.merchantEmailVerificationToken.create({
        data: {
            email,
            token,
            expiresAt,
            merchant_id,
        },
    });
};

// Find a token by its value
export const verifyEmail = async (email: string, token: string) => {
    return prisma.merchantEmailVerificationToken.findUnique({
        where: {
            email_token: {
                email: email,
                token: token,
            },
            expiresAt: { gt: new Date() }, // Check that it is not expired
            used: false, // Ensure that it has not been used
        },
    });
};

// Mark token as used after successful verification
export const markTokenAsUsed = async (email: string, token: string) => {
    await prisma.merchantEmailVerificationToken.update({
        where: {
            email_token: {
                email: email,
                token: token,
            },
        },
        data: { used: true },
    });
};
