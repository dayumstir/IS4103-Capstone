// Contains the business logic related to merchant payments
import {
    IMerchantPayment,
    IMerchantPaymentFilter,
} from "@repo/interfaces/merchantPaymentInterface";
import * as merchantPaymentRepository from "../repositories/merchantPaymentRepository";

// Create Merchant Payment
export const createMerchantPayment = async (
    merchant_id: string,
    paymentData: Omit<IMerchantPayment, "merchant">
) => {
    const merchantPayment = await merchantPaymentRepository.createMerchantPayment(
        merchant_id,
        paymentData
    );
    return merchantPayment;
};

// Get Merchant Payments
export const getMerchantPayments = async (search: string) => {
    const merchantPayments = await merchantPaymentRepository.getMerchantPayments(search);
    return merchantPayments;
};

// Get Merchant Payments By Filter
export const getMerchantPaymentsByFilter = async (filter: IMerchantPaymentFilter) => {
    const merchantPayments = await merchantPaymentRepository.getMerchantPaymentsByFilter(filter);
    return merchantPayments;
};

// Get Merchant Payment by ID
export const getMerchantPaymentById = async (merchant_payment_id: string) => {
    const merchantPayment =
        await merchantPaymentRepository.getMerchantPaymentById(merchant_payment_id);
    return merchantPayment;
};

// Update Merchant Payment
export const updateMerchantPayment = async (
    merchant_payment_id: string,
    paymentData: Partial<Omit<IMerchantPayment, "merchant">>
) => {
    const merchantPayment = await merchantPaymentRepository.updateMerchantPayment(
        merchant_payment_id,
        paymentData
    );
    return merchantPayment;
};
