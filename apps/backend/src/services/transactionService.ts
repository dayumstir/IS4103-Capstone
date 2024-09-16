// Contains the business logic related to transactions
import { ITransaction } from "../interfaces/transactionInterface";
import * as transactionRepository from "../repositories/transactionRepository";


export const createTransaction = async (transactionData: ITransaction) => {
    const transaction = await transactionRepository.createTransaction(transactionData);
    return transaction;
};


export const getUserTransactions = async (customer_id: string) => {
    const transactions = await transactionRepository.findTransactionsByCustomerId(customer_id);
    return transactions;
};


export const getTransactionById = async (transaction_id: string) => {
    const transaction = await transactionRepository.findTransactionById(transaction_id);
    if (!transaction) {
        throw new Error("Transaction not found");
    }
    return transaction;
};


export const updateTransaction = async (transaction_id: string, updateData: Partial<ITransaction>) => {
    const transaction = await transactionRepository.updateTransaction(transaction_id, updateData);
    if (!transaction) {
        throw new Error("Transaction not found");
    }
    return transaction;
};
