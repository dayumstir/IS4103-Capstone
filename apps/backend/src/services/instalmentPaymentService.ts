// Contains the business logic related to instalment payments
import { IInstalmentPayment } from "@repo/interfaces/instalmentPaymentInterface";
import * as instalmentPaymentRepository from "../repositories/instalmentPaymentRepository";
import logger from "../utils/logger";

export const getAllInstalmentPayments = async () => {
    logger.info("Executing getAllInstalmentPayments...");
    const instalmentPayments =
        await instalmentPaymentRepository.findAllInstalmentPayments();
    return instalmentPayments;
};

export const getCustomerOutstandingInstalmentPayments = async (customer_id: string) => {
    logger.info("Executing getCustomerInstalmentPayments...");
    const instalmentPayments =
        await instalmentPaymentRepository.findCustomerOutstandingInstalmentPayments(
            customer_id
        );
    return instalmentPayments;
};

export const getInstalmentPayment = async (instalment_payment_id: string) => {
    logger.info("Executing getInstalmentPayment...");
    const instalmentPayment =
        await instalmentPaymentRepository.findInstalmentPaymentById(
            instalment_payment_id
        );
    if (!instalmentPayment) {
        throw new Error("Instalment Payment not found");
    }
    return instalmentPayment;
};

export const editInstalmentPayment = async (
    instalment_payment_id: string,
    updateData: IInstalmentPayment
) => {
    logger.info("Executing editInstalmentPayment...");
    const instalmentPayment =
        await instalmentPaymentRepository.updateInstalmentPayment(
            instalment_payment_id,
            updateData
        );
    if (!instalmentPayment) {
        throw new Error("Instalment Payment not found");
    }
    return instalmentPayment;
};
