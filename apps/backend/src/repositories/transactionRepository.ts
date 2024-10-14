import { InstalmentPaymentStatus } from "@repo/interfaces/instalmentPaymentInterface";
import { prisma } from "./db";
import { ITransaction } from "@repo/interfaces/transactionInterface";
import { IInstalmentPayment } from "@repo/interfaces/instalmentPaymentInterface";
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
            paid_date: null,
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

    return prisma.transaction.create({
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
};

// Find transactions by customer_id in db
export const findTransactionsByCustomerId = async (customer_id: string) => {
    return prisma.transaction.findMany({
        where: { customer_id },
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

// Find transaction by id (unique attribute) in db
export const findTransactionById = async (transaction_id: string) => {
    return prisma.transaction.findUnique({
        where: { transaction_id },
        include: {
            merchant: true,
            instalment_plan: true,
            instalment_payments: {
                orderBy: {
                    due_date: "asc",
                },
            },
        },
    });
};
