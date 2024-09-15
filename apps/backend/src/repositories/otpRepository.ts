import { prisma } from "./db";


// Save OTP to the database
export const saveOTP = async (contact_number: string, otp: string, expiresAt: Date, customer_id: string) => {
    await prisma.otp.create({
        data: {
            contact_number,
            otp,
            expiresAt,
            customer_id,
        }
    });
};


// Find OTP in the database
export const findOTP = async (otp: string) => {
    return prisma.otp.findUnique({
        where: {
            otp,
            expiresAt: { gt: new Date() },      // Check that the OTP is not expired
            used: false,                        // Ensure that the OTP has not been used
        },
    });
};


// Mark OTP as used in the database
export const markOTPAsUsed = async (otp: string) => {
    await prisma.otp.update({
        where: { otp },
        data: { used: true },
    });
};