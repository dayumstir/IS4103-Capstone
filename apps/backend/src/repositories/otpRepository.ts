import { prisma } from "./db";


// Save OTP to the database
export const saveOTP = async (contact_number: string, otp: string) => {
    await prisma.otp.create({
        data: {
            contact_number,
            otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),   // OTP expires in 10 minutes
        }
    });
};


// Find OTP in the database
export const findOTP = async (contact_number: string, otp: string) => {
    return prisma.otp.findFirst({
        where: {
            contact_number,
            otp,
            expiresAt: { gt: new Date() },      // Check that the OTP is not expired
            used: false,    // Ensure that the OTP has not been used
        },
    });
};


// Mark OTP as used in the database
export const markOTPAsUsed = async (contact_number: string) => {
    await prisma.otp.updateMany({
        where: { contact_number },
        data: {
            used: true
        },
    });
};