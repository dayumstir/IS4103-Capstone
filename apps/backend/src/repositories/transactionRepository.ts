// Handles database operations related to transactions
import { prisma } from "./db";
import {
    ITransaction,
    TransactionStatus,
    TransactionFilter,
    IInstalmentPayment,
    InstalmentPaymentStatus,
} from "@repo/interfaces";
import { addMilliseconds, endOfDay } from "date-fns";

// Create a new transaction in db
export const createTransaction = async (transactionData: ITransaction) => {
    // Get the instalment plan by id
    const instalmentPlan = await prisma.instalmentPlan.findUnique({
        where: { instalment_plan_id: transactionData.instalment_plan_id },
    });

    if (!instalmentPlan) {
        throw new Error("Instalment plan not found");
    }

    // Calculate the amount per instalment
    const amountPerInstalment =
        transactionData.amount / instalmentPlan.number_of_instalments;

    // eg. Payment every 4.5 days
    const frequency =
        (instalmentPlan.time_period * 7) / instalmentPlan.number_of_instalments;

    // Function to add partial days to a date
    const addPartialDays = (date: Date, days: number) => {
        const milliseconds = days * 24 * 60 * 60 * 1000;
        return addMilliseconds(date, milliseconds);
    };

    // Calculate due dates for all instalment payments
    const dueDates = [];
    let dueDate = new Date(transactionData.date_of_transaction);
    for (let i = 0; i < instalmentPlan.number_of_instalments; i++) {
        // Calculate the next due date using the current non-rounded due date
        dueDate = addPartialDays(dueDate, frequency);

        // Round the current due date to the end of the day
        const roundedDueDate = endOfDay(dueDate); // 23:59:59
        dueDates.push(roundedDueDate);
    }

    // Initialise all instances of instalment payments
    const instalmentPayments: Omit<
        IInstalmentPayment,
        "instalment_payment_id" | "transaction"
    >[] = [];
    for (let i = 1; i <= instalmentPlan.number_of_instalments; i++) {
        instalmentPayments.push({
            amount_due: amountPerInstalment,
            late_payment_amount_due: 0,
            status: InstalmentPaymentStatus.UNPAID,
            due_date: dueDates[i - 1],
            instalment_number: i,
            amount_deducted_from_wallet: 0,

            transaction_id: transactionData.transaction_id,
        });
    }

    // Destructure id values to connect to other tables
    const {
        customer_id,
        merchant_id,
        instalment_plan_id,
        ...transactionDataWithoutRelations
    } = transactionData;

    // Create transaction
    const transaction = await prisma.transaction.create({
        data: {
            ...transactionDataWithoutRelations,
            customer: { connect: { customer_id: transactionData.customer_id } },
            merchant: { connect: { merchant_id: transactionData.merchant_id } },
            instalment_plan: {
                connect: {
                    instalment_plan_id: transactionData.instalment_plan_id,
                },
            },
            instalment_payments: {
                createMany: { data: instalmentPayments },
            },
        },
        include: {
            instalment_plan: true,
            instalment_payments: true,
        },
    });

    // Add transaction amount to merchant's wallet balance
    await prisma.merchant.update({
        where: { merchant_id: transactionData.merchant_id },
        data: {
            wallet_balance: {
                increment: transactionData.amount,
            },
        },
    });

    return transaction;
};

// Find all transactions in db
export const findAllTransactions = async (searchQuery: string) => {
    return prisma.transaction.findMany({
        where: {
            OR: [
                {
                    customer: {
                        name: { contains: searchQuery, mode: "insensitive" },
                    },
                },
                {
                    customer: {
                        email: { contains: searchQuery, mode: "insensitive" },
                    },
                },
                {
                    merchant: {
                        name: { contains: searchQuery, mode: "insensitive" },
                    },
                },
                {
                    merchant: {
                        email: { contains: searchQuery, mode: "insensitive" },
                    },
                },
                { amount: { equals: parseFloat(searchQuery) || undefined } },
            ],
        },
        include: {
            customer: true,
            merchant: true,
            instalment_plan: true,
            instalment_payments: true,
        },
        orderBy: {
            date_of_transaction: "desc",
        },
    });
};

// Find transactions by customer_id in db
export const findTransactionsByCustomerId = async (
    customer_id: string,
    searchQuery: string,
    dateFilter: string,
    statusFilter: string
) => {
    const whereClause: any = {
        customer_id,
    };

    if (searchQuery.length > 0) {
        whereClause.OR = [
            {
                merchant: {
                    name: {
                        contains: searchQuery,
                        mode: "insensitive",
                    },
                },
            },
            {
                amount: {
                    equals: parseFloat(searchQuery) || undefined,
                },
            },
        ];
    }

    if (dateFilter !== "all") {
        const currentDate = new Date();
        let startDate: Date;
        let endDate: Date;

        switch (dateFilter) {
            case "7days":
                startDate = new Date(
                    currentDate.getTime() - 7 * 24 * 60 * 60 * 1000
                );
                endDate = currentDate;
                break;
            case "30days":
                startDate = new Date(
                    currentDate.getTime() - 30 * 24 * 60 * 60 * 1000
                );
                endDate = currentDate;
                break;
            case "3months":
                startDate = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 3,
                    currentDate.getDate()
                );
                endDate = currentDate;
                break;
            case "6months":
                startDate = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 6,
                    currentDate.getDate()
                );
                endDate = currentDate;
                break;
            case "1year":
                startDate = new Date(
                    currentDate.getFullYear() - 1,
                    currentDate.getMonth(),
                    currentDate.getDate()
                );
                endDate = currentDate;
                break;
            default:
                startDate = new Date(0); // Beginning of time
                endDate = currentDate;
        }

        whereClause.date_of_transaction = {
            gte: startDate,
            lte: endDate,
        };
    }

    if (statusFilter !== "all") {
        whereClause.status =
            statusFilter === "fullypaid"
                ? TransactionStatus.FULLY_PAID
                : TransactionStatus.IN_PROGRESS;
    }

    return prisma.transaction.findMany({
        where: whereClause,
        include: {
            merchant: true,
            instalment_plan: true,
            instalment_payments: true,
        },
        orderBy: {
            date_of_transaction: "desc",
        },
    });
};

export const findTransactionsByFilter = async (
    transactionFilter: TransactionFilter
) => {
    const { sorting, create_from, create_to, search_term, ...filter } =
        transactionFilter;

    let parsedAmount: number | undefined;

    // Attempt to parse the search_term as a float
    if (search_term) {
        const parsed = parseFloat(search_term);
        // Only assign if parsed is a valid number
        if (!isNaN(parsed)) {
            parsedAmount = parsed;
        }
    }

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
                                {
                                    name: {
                                        contains: search_term,
                                        mode: "insensitive",
                                    },
                                },
                                {
                                    email: {
                                        contains: search_term,
                                        mode: "insensitive",
                                    },
                                },
                            ],
                        },
                    },
                    {
                        merchant: {
                            OR: [
                                {
                                    name: {
                                        contains: search_term,
                                        mode: "insensitive",
                                    },
                                },
                                {
                                    email: {
                                        contains: search_term,
                                        mode: "insensitive",
                                    },
                                },
                            ],
                        },
                    },
                    {
                        instalment_plan: {
                            name: {
                                contains: search_term,
                                mode: "insensitive",
                            },
                        },
                    },
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
                    merchant_id: true,
                    name: true,
                    email: true,
                },
            },
            instalment_payments: {
                orderBy: {
                    due_date: "asc",
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
        where: { transaction_id },
        data: updateData,
    });
};
