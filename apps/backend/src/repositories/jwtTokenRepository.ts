// Handles database operations related to tokens
import { prisma } from "./db";


// Blacklist a token
export const blacklistToken = async (token: string, expiresAt: Date) => {
    try {
        await prisma.tokenBlackList.create({
            data: {
                token: token,
                expiresAt: expiresAt,
            }
        });
    } catch (error) {
        throw new Error("Failed to blacklist the token");
    }
};


// Find token in db
export const findToken = async (token: string) => {
    return prisma.tokenBlackList.findUnique({ where: { token } });
};
