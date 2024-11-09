// Handles database operations related to transactions
import { prisma } from "./db";
import {
    ITransaction,
    TransactionStatus,
    TransactionFilter,
    IInstalmentPayment,
    InstalmentPaymentStatus,
} from "@repo/interfaces";
import {
    addMilliseconds,
    endOfDay,
    endOfMonth,
    startOfDay,
    startOfMonth,
    startOfYear,
    subDays,
    subMonths,
    subYears,
} from "date-fns";

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

// Get transaction stats
export const getTransactionStats = async () => {
    const currentDate = new Date();
    const thirtyDaysAgo = subDays(currentDate, 30);
    const previousThirtyDays = subDays(thirtyDaysAgo, 30);

    // Current month range
    const currentMonthStart = startOfMonth(currentDate);
    const currentMonthEnd = endOfMonth(currentDate);

    // Previous month range
    const previousMonthStart = startOfMonth(subDays(currentMonthStart, 1));
    const previousMonthEnd = endOfMonth(previousMonthStart);

    // Get current month's total volume
    const currentMonthVolume = await prisma.transaction.aggregate({
        where: {
            date_of_transaction: {
                gte: currentMonthStart,
                lte: currentMonthEnd,
            },
        },
        _sum: {
            amount: true,
        },
    });

    // Get previous month's total volume
    const previousMonthVolume = await prisma.transaction.aggregate({
        where: {
            date_of_transaction: {
                gte: previousMonthStart,
                lte: previousMonthEnd,
            },
        },
        _sum: {
            amount: true,
        },
    });

    // Calculate volume increase percentage
    const currentVolume = currentMonthVolume._sum.amount || 0;
    const previousVolume = previousMonthVolume._sum.amount || 0;
    const volumeIncrease =
        previousVolume === 0
            ? 0
            : ((currentVolume - previousVolume) / previousVolume) * 100;

    // Get active customers (customers with transactions in last 30 days)
    const activeCustomers = await prisma.transaction.groupBy({
        by: ["customer_id"],
        where: {
            date_of_transaction: {
                gte: thirtyDaysAgo,
            },
        },
        _count: true,
    });

    // Get previous period's active customers
    const previousActiveCustomers = await prisma.transaction.groupBy({
        by: ["customer_id"],
        where: {
            date_of_transaction: {
                gte: previousThirtyDays,
                lt: thirtyDaysAgo,
            },
        },
        _count: true,
    });

    // Get total number of customers
    const totalCustomers = await prisma.customer.count();

    // Calculate customer growth
    const currentActiveCount = activeCustomers.length;
    const previousActiveCount = previousActiveCustomers.length;
    const customerGrowth =
        previousActiveCount === 0
            ? 0
            : ((currentActiveCount - previousActiveCount) /
                  previousActiveCount) *
              100;

    // Calculate current month's average transaction size
    const currentAvgTransactionSize = await prisma.transaction.aggregate({
        where: {
            date_of_transaction: {
                gte: currentMonthStart,
                lte: currentMonthEnd,
            },
        },
        _avg: {
            amount: true,
        },
    });

    // Calculate previous month's average transaction size
    const previousAvgTransactionSize = await prisma.transaction.aggregate({
        where: {
            date_of_transaction: {
                gte: previousMonthStart,
                lte: previousMonthEnd,
            },
        },
        _avg: {
            amount: true,
        },
    });

    const currentAvg = currentAvgTransactionSize._avg.amount || 0;
    const previousAvg = previousAvgTransactionSize._avg.amount || 0;
    const avgTransactionChange =
        previousAvg === 0
            ? 0
            : ((currentAvg - previousAvg) / previousAvg) * 100;

    // Calculate default rate based on instalment payments
    const defaultedInstalments = await prisma.instalmentPayment.count({
        where: {
            due_date: {
                gte: currentMonthStart,
                lte: currentMonthEnd,
            },
            AND: [
                { paid_date: null },
                { due_date: { lt: currentDate } },
                { status: "UNPAID" },
            ],
        },
    });

    const totalInstalments = await prisma.instalmentPayment.count({
        where: {
            due_date: {
                gte: currentMonthStart,
                lte: currentMonthEnd,
            },
        },
    });

    // Previous month default rate
    const previousDefaultedInstalments = await prisma.instalmentPayment.count({
        where: {
            due_date: {
                gte: previousMonthStart,
                lte: previousMonthEnd,
            },
            AND: [
                { paid_date: null },
                { due_date: { lt: currentDate } },
                { status: "UNPAID" },
            ],
        },
    });

    const previousTotalInstalments = await prisma.instalmentPayment.count({
        where: {
            due_date: {
                gte: previousMonthStart,
                lte: previousMonthEnd,
            },
        },
    });

    const currentDefaultRate =
        totalInstalments === 0
            ? 0
            : (defaultedInstalments / totalInstalments) * 100;
    const previousDefaultRate =
        previousTotalInstalments === 0
            ? 0
            : (previousDefaultedInstalments / previousTotalInstalments) * 100;
    const defaultRateChange =
        previousDefaultRate === 0
            ? 0
            : currentDefaultRate - previousDefaultRate;

    // Get transactions within last 30 days
    const transactionsWithinLast30Days = await prisma.transaction.findMany({
        where: {
            date_of_transaction: {
                gte: startOfDay(thirtyDaysAgo),
            },
        },
    });

    // Get transactions within last 12 months
    const twelveMonthsAgo = subMonths(currentDate, 12);
    const transactionsWithinLast12Months = await prisma.transaction.findMany({
        where: {
            date_of_transaction: {
                gte: startOfMonth(twelveMonthsAgo),
            },
        },
    });

    // Get transactions within last 5 years
    const fiveYearsAgo = subYears(currentDate, 5);
    const transactionsWithinLast5Years = await prisma.transaction.findMany({
        where: {
            date_of_transaction: {
                gte: startOfYear(fiveYearsAgo),
            },
        },
    });

    // Fill in all days with volume 0
    let dailyVolume: { date: Date; volume: number }[] = [];
    for (let i = 0; i <= 30; i++) {
        const date = startOfDay(subDays(currentDate, i));
        dailyVolume.push({ date, volume: 0 });
    }

    // Fill in all months with volume 0
    let monthlyVolume: { date: Date; volume: number }[] = [];
    for (let i = 0; i <= 12; i++) {
        const date = startOfMonth(subMonths(currentDate, i));
        monthlyVolume.push({ date, volume: 0 });
    }

    // Fill in all years with volume 0
    let yearlyVolume: { date: Date; volume: number }[] = [];
    for (let i = 0; i <= 5; i++) {
        const date = startOfYear(subYears(currentDate, i));
        yearlyVolume.push({ date, volume: 0 });
    }

    // Add up the volume for each day
    for (const transaction of transactionsWithinLast30Days) {
        const date = startOfDay(transaction.date_of_transaction);
        dailyVolume.find((v) => v.date.getTime() === date.getTime())!.volume +=
            transaction.amount;
    }

    // Add up the volume for each month
    for (const transaction of transactionsWithinLast12Months) {
        const date = startOfMonth(transaction.date_of_transaction);
        monthlyVolume.find(
            (v) => v.date.getTime() === date.getTime()
        )!.volume += transaction.amount;
    }

    // Add up the volume for each year
    for (const transaction of transactionsWithinLast5Years) {
        const date = startOfYear(transaction.date_of_transaction);
        yearlyVolume.find((v) => v.date.getTime() === date.getTime())!.volume +=
            transaction.amount;
    }

    return {
        volumeIncrease,
        activeCustomers: activeCustomers.length,
        totalCustomers,
        customerGrowth,
        avgTransactionSize: currentAvg,
        avgTransactionChange,
        currentDefaultRate,
        defaultRateChange,
        dailyVolume: dailyVolume.reverse(),
        monthlyVolume: monthlyVolume.reverse(),
        yearlyVolume: yearlyVolume.reverse(),
    };
};
