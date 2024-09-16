import { prisma } from "./db";


// Create a password reset token
export const createToken = async (email: string, token: string, expiresAt: Date, customer_id: string) => {
    return prisma.passwordResetToken.create({
        data: {
            email,
            token,
            expiresAt,
            customer_id,
        }
    });
};

// Find a password reset token
export const findToken = async (token: string) => {
    return prisma.passwordResetToken.findUnique({
        where: {
            token,
            expiresAt: { gt: new Date() },      // Check that the token is not expired
            used: false,                        // Ensure that the token has not been used
        },
    });
};


// Delete a password reset token
export const deleteToken = async (token: string) => {
    return prisma.passwordResetToken.delete({
        where: { token }
    });
};
