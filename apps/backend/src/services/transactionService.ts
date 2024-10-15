// Contains the business logic related to transactions
import { ITransaction } from "@repo/interfaces/transactionInterface";
import * as transactionRepository from "../repositories/transactionRepository";

export const createTransaction = async (transactionData: ITransaction) => {
    const transaction =
        await transactionRepository.createTransaction(transactionData);
    return transaction;
};

export const getCustomerTransactions = async (
    customer_id: string,
    searchQuery: string,
    dateFilter: string,
    statusFilter: string
) => {
    const transactions =
        await transactionRepository.findTransactionsByCustomerId(
            customer_id,
            searchQuery,
            dateFilter,
            statusFilter
        );
    return transactions;
};

export const getTransactionById = async (transaction_id: string) => {
    const transaction =
        await transactionRepository.findTransactionById(transaction_id);
    if (!transaction) {
        throw new Error("Transaction not found");
    }
    return transaction;
};
