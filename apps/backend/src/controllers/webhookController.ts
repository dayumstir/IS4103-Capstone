import { Request, Response } from 'express';
import { stripe } from '../utils/stripe';
import Stripe from 'stripe'; // Import Stripe types
import { topUpWallet } from '../services/customerService';

export const handleStripeWebhook = async (req: Request, res: Response) => {
    console.log('Type of req.body:', typeof req.body);
    console.log('Is req.body a Buffer?', req.body instanceof Buffer);
    console.log('Headers:', req.headers);
    console.log(req.body);


    const sig = req.headers['stripe-signature'];

    if (!sig) {
        console.error('Webhook signature is missing.');
        return res.status(400).send('Webhook signature is missing.');
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        throw new Error("STRIPE_WEBHOOK_SECRET is not defined in the environment variables");
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error(`Webhook signature verification failed: ${(err as Error).message}`);
        return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const customer_id = paymentIntent.metadata.customer_id;
        const amount = paymentIntent.amount / 100; // Convert back to dollars

        try {
            await topUpWallet(customer_id, amount);
            console.log(`Wallet topped up for customer ${customer_id} by $${amount}`);
        } catch (err: any) {
            console.error(`Failed to update wallet balance: ${err.message}`);
        }
    }

    res.status(200).send('Received webhook');
};
