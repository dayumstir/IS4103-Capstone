// src/controllers/paymentController.ts
import { Request, Response, NextFunction } from "express";
import * as customerService from '../services/customerService';
import logger from "../utils/logger";
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from "../utils/error";
import { stripe } from "../utils/stripe";

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
        // Get customer from database
        const customer = await customerService.getCustomerById(customer_id);
        if (!customer) {
            return next(new NotFoundError("Customer not found"));
        }

        // Check if customer exists in Stripe
        let stripeCustomer;

        const existingCustomers = await stripe.customers.list({
            email: customer.email,
            limit: 1,
        });

        if (existingCustomers.data.length > 0) {
            stripeCustomer = existingCustomers.data[0];
        } else {
            // Create a new customer in Stripe
            stripeCustomer = await stripe.customers.create({
                email: customer.email,
                name: customer.name,
                phone: customer.contact_number,
            });
        }

        // Create ephemeral key
        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: stripeCustomer.id },
            { apiVersion: "2024-09-30.acacia" }
        );

        // Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
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
