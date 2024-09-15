// Handles database operations related to transactions
import { prisma } from "./db";
import { ITransaction } from "../interfaces/transactionInterface";


// Create a new transaction in db
export const createTransaction = async (transactionData: ITransaction) => {
    return prisma.transaction.create({ data: transactionData });
};


// Find transactions by customer_id in db
export const findTransactionsByCustomerId = async (customer_id: string) => {
    return prisma.transaction.findMany({ where: { customer_id } });
};


// Find transaction by id (unique attribute) in db
export const findTransactionById = async (transaction_id: string) => {
    return prisma.transaction.findUnique({ where: { transaction_id } });
};


// Update transaction in db
export const updateTransaction = async (transaction_id: string, updateData: Partial<ITransaction>) => {
    return prisma.transaction.update({
        where: { transaction_id: transaction_id },
        data: updateData,
    });
};
