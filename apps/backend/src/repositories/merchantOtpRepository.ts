import { prisma } from "./db";

// Save OTP to the database
export const saveOTP = async (contact_number: string, otp: string, expiresAt: Date) => {
    await prisma.merchantOtp.create({
        data: {
            contact_number,
            otp,
            expiresAt,
        },
    });
};

// Find OTP in the database
export const verifyContactNumber = async (contact_number: string, otp: string) => {
    return prisma.merchantOtp.findUnique({
        where: {
            contact_number,
            otp,
            expiresAt: { gt: new Date() }, // Check that the OTP is not expired
            used: false, // Ensure that the OTP has not been used
        },
    });
};

// Mark OTP as used in the database
export const markOTPAsUsed = async (otp: string) => {
    await prisma.merchantOtp.update({
        where: { otp },
        data: { used: true },
    });
};

export const checkPhoneNumberVerified = async (contact_number: string) => {
    // Get the latest OTP record for the given contact number
    const otpRecords = await prisma.merchantOtp.findMany({
        where: {
            contact_number: contact_number,
        },
        orderBy: {
            createdAt: "desc", // Order by createdAt in descending order
        },
        take: 1, // Get only the latest record
    });

    // Check if we found any records
    if (otpRecords.length > 0) {
        const latestOtp = otpRecords[0]; // Get the latest record

        // Ensure the OTP has not been used and has not expired
        if (!latestOtp.used && latestOtp.expiresAt > new Date()) {
            return true; // Phone number is verified
        }
    }

    return false; // Phone number is not verified
};
