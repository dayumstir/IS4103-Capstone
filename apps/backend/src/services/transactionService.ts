// Contains the business logic related to transactions
import {
    ITransaction,
    TransactionFilter,
    TransactionStatus,
} from "@repo/interfaces";
import * as transactionRepository from "../repositories/transactionRepository";

export const createTransaction = async (transactionData: ITransaction) => {
    if (!transactionData.date_of_transaction) {
        transactionData.date_of_transaction = new Date();
    }
    if (!transactionData.status) {
        transactionData.status = TransactionStatus.IN_PROGRESS;
    }
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

export const getTransactionByFilter = async (filter: TransactionFilter) => {
    const transactions =
        await transactionRepository.findTransactionsByFilter(filter);
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

export const updateTransaction = async (
    transaction_id: string,
    updateData: Partial<ITransaction>
) => {
    const transaction = await transactionRepository.updateTransaction(
        transaction_id,
        updateData
    );
    if (!transaction) {
        throw new Error("Transaction not found");
    }
    return transaction;
};
