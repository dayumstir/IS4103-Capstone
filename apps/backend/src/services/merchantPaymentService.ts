// Contains the business logic related to merchant payments
import { IMerchantPayment } from "@repo/interfaces/merchantPaymentInterface";
import * as merchantPaymentRepository from "../repositories/merchantPaymentRepository";

// Create Merchant Payment
export const createMerchantPayment = async (
    merchant_id: string,
    paymentData: Omit<IMerchantPayment, "merchant">
) => {
    const merchantPayment =
        await merchantPaymentRepository.createMerchantPayment(
            merchant_id,
            paymentData
        );
    return merchantPayment;
};
