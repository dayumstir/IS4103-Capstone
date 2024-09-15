import { prisma } from "../repositories/db";

export const cleanupExpiredTokens = async () => {
    try {
        // Delete expired email verification tokens
        const deletedEmailVerificationTokens = await prisma.emailVerificationToken.deleteMany({
            where: {
                expiresAt: { lt: new Date() },  // Tokens where expiredAt is less than current time
                used: false,
            },
        });

        // Delete expired OTPs
        const deletedOtps = await prisma.otp.deleteMany({
            where: {
                expiresAt: { lt: new Date() },  // Tokens where expiredAt is less than current time
                used: false,
            },
        });

        console.log(`Expired tokens cleanup completed. Deleted ${deletedEmailVerificationTokens.count} email tokens and ${deletedOtps.count} OTPs.`);
    } catch (error) {
        console.error("Error during expired tokens cleanup", error);
    }
};