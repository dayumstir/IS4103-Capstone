// Handles database operations related to transactions
import { prisma } from "./db";
import {
    TransactionFilter,
    TransactionStatus,
    ITransaction,
} from "../../../../packages/interfaces/transactionInterface";

// Create a new transaction in db
export const createTransaction = async (transactionData: ITransaction) => {
    return prisma.transaction.create({ data: transactionData });
};

// Find transactions by customer_id in db
export const findTransactionsByCustomerId = async (customer_id: string) => {
    return prisma.transaction.findMany({ where: { customer_id } });
};

export const findTransactionsByFilter = async (transactionFilter: TransactionFilter) => {
    const { sorting, create_from, create_to, search_term, ...filter } = transactionFilter;

    let parsedAmount: number | undefined;

    // Attempt to parse the search_term as a float
    if (search_term) {
        const parsed = parseFloat(search_term);
        // Only assign if parsed is a valid number
        if (!isNaN(parsed)) {
            parsedAmount = parsed;
        }
    }

    const statusMatches: TransactionStatus[] = search_term
        ? (Object.values(TransactionStatus).filter((status) =>
              status.toLowerCase().includes(search_term.toLowerCase())
          ) as TransactionStatus[])
        : [];

    return prisma.transaction.findMany({
        where: {
            ...filter,
            AND: [
                { date_of_transaction: { lte: create_to } },
                { date_of_transaction: { gte: create_from } },
            ],
            ...(search_term && {
                OR: [
                    { amount: { equals: parsedAmount } },
                    { reference_no: { contains: search_term } },
                    { cashback_percentage: { equals: parsedAmount } },
                    {
                        customer: {
                            OR: [
                                { name: { contains: search_term, mode: "insensitive" } },
                                { email: { contains: search_term, mode: "insensitive" } },
                            ],
                        },
                    },
                    {
                        merchant: {
                            OR: [
                                { name: { contains: search_term, mode: "insensitive" } },
                                { email: { contains: search_term, mode: "insensitive" } },
                            ],
                        },
                    },
                    { instalment_plan: { name: { contains: search_term, mode: "insensitive" } } },
                ],
            }),
        },
        orderBy: sorting
            ? { [sorting.sortBy]: sorting.sortDirection }
            : { date_of_transaction: "desc" },
        include: {
            instalment_plan: true,
            customer: {
                select: {
                    name: true,
                    email: true,
                },
            },
            merchant: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
    });
};

// Find transaction by id (unique attribute) in db
export const findTransactionById = async (transaction_id: string) => {
    return prisma.transaction.findUnique({
        where: { transaction_id },
        include: {
            instalment_plan: true,
            customer: {
                select: {
                    name: true,
                    email: true,
                },
            },
            merchant: {
                select: {
                    name: true,
                    email: true,
                },
            },
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
};

// Update transaction in db
export const updateTransaction = async (
    transaction_id: string,
    updateData: Partial<ITransaction>
) => {
    return prisma.transaction.update({
        where: { transaction_id: transaction_id },
        data: updateData,
    });
};
