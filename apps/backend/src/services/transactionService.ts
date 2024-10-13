// Contains the business logic related to transactions
import * as transactionRepository from "../repositories/transactionRepository";
import {
    ITransaction,
    TransactionFilter,
    TransactionStatus,
} from "../../../../packages/interfaces/transactionInterface";

export const createTransaction = async (transactionData: ITransaction) => {
    if (!transactionData.date_of_transaction) {
        transactionData.date_of_transaction = new Date();
    }
    if (!transactionData.status) {
        transactionData.status = TransactionStatus.IN_PROGRESS;
    }
    const transaction = await transactionRepository.createTransaction(transactionData);
    return transaction;
};

export const getUserTransactions = async (customer_id: string) => {
    const transactions = await transactionRepository.findTransactionsByCustomerId(customer_id);
    return transactions;
};

export const getTransactionByFilter = async (filter: TransactionFilter) => {
    const transactions = await transactionRepository.findTransactionsByFilter(filter);
    return transactions;
};

export const getTransactionById = async (transaction_id: string) => {
    const transaction = await transactionRepository.findTransactionById(transaction_id);
    if (!transaction) {
        throw new Error("Transaction not found");
    }
    return transaction;
};

export const updateTransaction = async (
    transaction_id: string,
    updateData: Partial<ITransaction>
) => {
    const transaction = await transactionRepository.updateTransaction(transaction_id, updateData);
    if (!transaction) {
        throw new Error("Transaction not found");
    }
    return transaction;
};
