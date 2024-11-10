// Handles database operations related to merchant payments
import { subMonths } from "date-fns";
import { prisma } from "./db";
import {
    IMerchantPayment,
    IMerchantPaymentFilter,
} from "@repo/interfaces/merchantPaymentInterface";

// Create Merchant Payment
export const createMerchantPayment = async (
    merchant_id: string,
    paymentData: Omit<IMerchantPayment, "merchant">
) => {
    const payment = await prisma.merchantPayment.create({
        data: { ...paymentData, merchant_id },
    });

    await prisma.merchant.update({
        where: { merchant_id },
        data: {
            wallet_balance: {
                decrement: paymentData.total_amount_from_transactions,
            },
        },
    });

    return payment;
};

// Get Merchant Payments
export const getMerchantPayments = async (search: string) => {
    const payments = await prisma.merchantPayment.findMany({
        where: {
            OR: [
                {
                    merchant: {
                        name: { contains: search, mode: "insensitive" },
                    },
                },
                {
                    merchant: {
                        email: { contains: search, mode: "insensitive" },
                    },
                },
                {
                    total_amount_from_transactions: {
                        equals: parseFloat(search) || undefined,
                    },
                },
                {
                    final_payment_amount: {
                        equals: parseFloat(search) || undefined,
                    },
                },
            ],
        },
        include: {
            merchant: true,
        },
        orderBy: {
            created_at: "desc",
        },
    });
    return payments;
};

export const getMerchantPaymentsByFilter = async (paymentFilter: IMerchantPaymentFilter) => {
    const { sorting, create_from, create_to, search_term, ...filter } = paymentFilter;

    let parsedAmount: number | undefined;

    // Attempt to parse the search_term as a float
    if (search_term) {
        const parsed = parseFloat(search_term);
        // Only assign if parsed is a valid number
        if (!isNaN(parsed)) {
            parsedAmount = parsed;
        }
    }

    return prisma.merchantPayment.findMany({
        where: {
            ...filter,
            AND: [{ created_at: { lte: create_to } }, { created_at: { gte: create_from } }],
            ...(search_term && {
                OR: [
                    { total_amount_from_transactions: { equals: parsedAmount } },
                    { final_payment_amount: { equals: parsedAmount } },
                ],
            }),
        },
        orderBy: sorting ? { [sorting.sortBy]: sorting.sortDirection } : { created_at: "desc" },
    });
};

// Get Merchant Payment by ID
export const getMerchantPaymentById = async (merchant_payment_id: string) => {
    const payment = await prisma.merchantPayment.findUnique({
        where: { merchant_payment_id },
        include: {
            issues: {
                select: {
                    issue_id: true,
                    create_time: true,
                    status: true,
                    title: true,
                    description: true,
                },
            },
        },
    });
    return payment;
};

// Update Merchant Payment
export const updateMerchantPayment = async (
    merchant_payment_id: string,
    paymentData: Partial<Omit<IMerchantPayment, "merchant">>
) => {
    const payment = await prisma.merchantPayment.update({
        where: { merchant_payment_id },
        data: {
            ...paymentData,
            evidence: {
                set: paymentData.evidence ? Buffer.from(paymentData.evidence) : undefined,
            },
        },
    });
    return payment;
};

// Calculate Withdrawal Info
export const calculateWithdrawalInfo = async (merchant_id: string) => {
    const transactionsWithinLastMonth = await prisma.transaction.findMany({
        where: {
            merchant_id,
            date_of_transaction: {
                gte: subMonths(new Date(), 1),
            },
        },
    });

    const monthlyRevenue = transactionsWithinLastMonth.reduce(
        (acc, transaction) => acc + transaction.amount,
        0
    );

    const merchant = await prisma.merchant.findUnique({
        where: { merchant_id: merchant_id },
    });

    const merchantSize = await prisma.merchantSize.findFirst({
        where: {
            monthly_revenue_min: { lte: monthlyRevenue },
            monthly_revenue_max: { gte: monthlyRevenue },
        },
    });

    const withdrawalFeeRate = await prisma.withdrawalFeeRate.findFirst({
        where: {
            merchant_size_id: merchantSize?.merchant_size_id,
            wallet_balance_min: { lte: merchant?.wallet_balance },
            wallet_balance_max: { gte: merchant?.wallet_balance },
        },
    });

    return { withdrawalFeeRate, monthlyRevenue, merchantSize };
};
