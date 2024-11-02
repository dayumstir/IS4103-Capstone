// app/backend/src/controllers/webhookController.ts
import { Request, Response } from "express";
import Stripe from "stripe"; // Import Stripe types
import { stripe } from "../utils/stripe";
import logger from "../utils/logger";
import { topUpWallet } from "../services/customerService";
import { createPaymentHistory } from "../services/paymentHistoryService";
import { PaymentType } from "@repo/interfaces";

export const handleStripeWebhook = async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"];

    // Check if Stripe signature header is present
    if (!signature) {
        logger.error("Webhook signature is missing.");
        return res.status(400).send("Webhook signature is missing.");
    }

    // Ensure the webhook secret is set in environment variables
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        throw new Error("STRIPE_WEBHOOK_SECRET is not defined in the environment variables");
    }

    let event: Stripe.Event;

    try {
        // Construct the Stripe event with the signature and secret
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (error) {
        logger.error(`Webhook signature verification failed: ${(error as Error).message}`);
        return res.status(400).send(`Webhook Error: ${(error as Error).message}`);
    }

    // Process the event if it's a successful payment intent
    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const customerId = paymentIntent.metadata.customer_id;
        const amount = paymentIntent.amount / 100; // Convert cents to dollars

        try {
            // Update wallet balance and create payment history
            await topUpWallet(customerId, amount);
            await createPaymentHistory(amount, PaymentType.TOP_UP, customerId);
            logger.info(`Wallet topped up for customer ${customerId} by $${amount}`);
        } catch (error) {
            logger.error(`Failed to update wallet balance for customer ${customerId}: ${(error as Error).message}`);
        }
    }

    // Respond to Stripe to confirm receipt of the webhook
    res.status(200).send("Received webhook");
};
