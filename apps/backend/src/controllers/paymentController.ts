// app/backend/src/controllers/paymentController.ts
import { NextFunction, Request, Response } from "express";
import { PaymentType, InstalmentPaymentStatus } from "@repo/interfaces";
import { stripe } from "../utils/stripe";
import logger from "../utils/logger";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../utils/error";

import * as customerService from "../services/customerService";
import * as instalmentPaymentService from "../services/instalmentPaymentService";
import * as paymentHistoryService from "../services/paymentHistoryService";
import * as voucherService from "../services/voucherService";

// Top Up Wallet
export const topUpWallet = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing topUpWallet...");

    const { amount } = req.body;
    if (!amount) {
        return next(new BadRequestError("amount is required"));
    }

    const customer_id = req.customer_id;
    if (!customer_id) {
        return next(new UnauthorizedError("Unauthorized: customer_id is missing"));
    }

    try {
        // Fetch customer from database
        const customer = await customerService.getCustomerById(customer_id);
        if (!customer) {
            return next(new NotFoundError("Customer not found"));
        }

        // Check if customer exists in Stripe, or create a new one
        const existingCustomers = await stripe.customers.list({ email: customer.email, limit: 1 });
        const stripeCustomer = existingCustomers.data.length > 0
            ? existingCustomers.data[0]
            : await stripe.customers.create({
                email: customer.email,
                name: customer.name,
                phone: customer.contact_number,
            });

        // Create ephemeral key for Stripe API
        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: stripeCustomer.id },
            { apiVersion: "2024-09-30.acacia" }
        );

        // Create PaymentIntent for top-up
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: "sgd",
            customer: stripeCustomer.id,
            automatic_payment_methods: { 
                enabled: true 
            },
            metadata: {
                customer_id,
            },
        });

        res.status(200).json({ 
            paymentIntent: paymentIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: stripeCustomer.id,
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        });
    } catch (error) {
        logger.error("Error during top up wallet:", error);
        next(error);
    }
};

// Get Payment History by Customer ID
export const getPaymentHistoryByCustomerId = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing getPaymentHistoryByCustomerId...");

    const { customer_id } = req;
    if (!customer_id) {
        return next(new UnauthorizedError("Unauthorized: customer_id is missing"));
    }

    try {
        const paymentHistoryRecords = await paymentHistoryService.getPaymentHistoryByCustomerId(customer_id);
        res.status(200).json(paymentHistoryRecords);
    } catch (error) {
        logger.error("Error during getPaymentHistoryByCustomerId:", error);
        next(error);
    }
};

// Make Payment
export const makePayment = async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Executing makePayment...");

    const { customer_id } = req;
    if (!customer_id) {
        return next(new UnauthorizedError("Unauthorized: customer_id is missing"));
    }

    const {
        instalment_payment_id,
        voucher_assigned_id,
        amount_discount_from_voucher = 0,
        amount_deducted_from_wallet = 0,
    } = req.body;

    try {
        // Fetch instalment payment details from the database
        const instalmentPayment = await instalmentPaymentService.getInstalmentPayment(instalment_payment_id);
        
        if (!instalmentPayment) {
            throw new NotFoundError("Instalment payment not found");
        }

        if (instalmentPayment.status === InstalmentPaymentStatus.PAID) {
            throw new BadRequestError("Instalment payment is already paid");
        }

        // Deduct specified amount from wallet, if applicable
        if (amount_deducted_from_wallet > 0) {
            await customerService.topUpWallet(customer_id, -amount_deducted_from_wallet);
        }

        // Mark voucher as used, if applicable
        if (voucher_assigned_id) {
            await voucherService.useVoucher(voucher_assigned_id);
        }

        // Record payment history for the transaction
        await paymentHistoryService.createPaymentHistory(amount_deducted_from_wallet, PaymentType.INSTALMENT_PAYMENT, customer_id);

        // Update instalment payment details in the database
        await instalmentPaymentService.editInstalmentPayment(instalment_payment_id, {
            voucher_assigned_id,
            amount_discount_from_voucher,
            amount_deducted_from_wallet,
            status: InstalmentPaymentStatus.PAID,
            paid_date: new Date(),
        });

        res.status(200).json({ message: "Payment successful" });
    } catch (error) {
        logger.error("Error during makePayment:", error);
        next(error);
    }
};
