import { prisma } from "../repositories/db";
import logger from "./logger";

export const cleanupExpiredTokens = async () => {
    logger.info('Executing cleanupExpiredTokens...');
    try {
        // Delete expired email verification tokens
        const deletedEmailVerificationTokens = await prisma.emailVerificationToken.deleteMany({
            where: {
                expiresAt: { lt: new Date() },  // Tokens where expiredAt is less than current time
            },
        });

        // Delete expired OTPs
        const deletedOtps = await prisma.otp.deleteMany({
            where: {
                expiresAt: { lt: new Date() },  // Tokens where expiredAt is less than current time
            },
        });

        // Delete expired JWTs
        const deletedJWTs = await prisma.tokenBlackList.deleteMany({
            where: {
                expiresAt: { lt: new Date() },  // Tokens where expiredAt is less than current time
            },
        });

        logger.info(`Expired tokens cleanup completed. Deleted ${deletedEmailVerificationTokens.count} email tokens, ${deletedOtps.count} OTPs and ${deletedJWTs.count} blacklisted JWTs.`);
    } catch (error) {
        logger.error("Error during expired tokens cleanup", error);
    }
};
