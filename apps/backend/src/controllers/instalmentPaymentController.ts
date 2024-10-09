import { Request, Response } from "express";
import * as instalmentPaymentService from "../services/instalmentPaymentService";
import logger from "../utils/logger";

export const getAllInstalmentPayments = async (req: Request, res: Response) => {
    try {
        const instalmentPayments =
            await instalmentPaymentService.getAllInstalmentPayments();
        res.status(200).json(instalmentPayments);
    } catch (error: any) {
        logger.error(`Error in getAllInstalmentPayments: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};

export const getInstalmentPaymentsByTransaction = async (
    req: Request,
    res: Response
) => {
    try {
        const { transaction_id } = req.params;
        const instalmentPayments =
            await instalmentPaymentService.getInstalmentPaymentsByTransaction(
                transaction_id
            );
        res.status(200).json(instalmentPayments);
    } catch (error: any) {
        logger.error(
            `Error in getInstalmentPaymentsByTransaction: ${error.message}`
        );
        res.status(400).json({ error: error.message });
    }
};

export const getInstalmentPayment = async (req: Request, res: Response) => {
    try {
        const { instalment_payment_id } = req.params;
        const instalmentPayment =
            await instalmentPaymentService.getInstalmentPayment(
                instalment_payment_id
            );
        if (!instalmentPayment) {
            return res
                .status(404)
                .json({ error: "Instalment payment not found" });
        }
        res.status(200).json(instalmentPayment);
    } catch (error: any) {
        logger.error(`Error in getInstalmentPayment: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};

export const editInstalmentPayment = async (req: Request, res: Response) => {
    try {
        const { instalment_payment_id } = req.params;
        const updatedData = req.body;
        const updatedInstalmentPayment =
            await instalmentPaymentService.editInstalmentPayment(
                instalment_payment_id,
                updatedData
            );
        res.status(200).json(updatedInstalmentPayment);
    } catch (error: any) {
        logger.error(`Error in editInstalmentPayment: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
};
