// Manages transaction-related actions
import { Request, Response } from "express";
import * as transactionService from "../services/transactionService";

// Create Transaction
export const createTransaction = async (req: Request, res: Response) => {
    try {
        const transaction = await transactionService.createTransaction(
            req.body
        );
        res.status(201).json(transaction);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// Get User Transactions
export const getUserTransactions = async (req: Request, res: Response) => {
    try {
        const customer_id = req.customer_id; // from authMiddleware
        if (!customer_id) {
            return res
                .status(401)
                .json({ error: "Unauthorized: No customer ID provided" });
        }
        const transactions =
            await transactionService.getUserTransactions(customer_id);
        res.status(200).json(transactions);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// Get Transaction
export const getTransaction = async (req: Request, res: Response) => {
    try {
        const transaction = await transactionService.getTransactionById(
            req.params.transaction_id
        );
        res.status(200).json(transaction);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
