// src/redux/services/paymentService.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { API_URL } from "../../config/apiConfig";
import { IPaymentHistory } from "@repo/interfaces";

interface PaymentIntentResponse {
    paymentIntent: string;
    ephemeralKey: string;
    customer: string;
    publishableKey: string;
}

// Define the request body interface for makePayment
interface MakePaymentRequest {
    instalment_payment_id: string;
    voucher_assigned_id?: string;
    amount_discount_from_voucher?: number;
    amount_deducted_from_wallet: number;
}

export const paymentApi = createApi({
    reducerPath: "paymentApi",

    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/payment`,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).customerAuth.token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),

    endpoints: (builder) => ({
        // Fetch payment sheet parameters
        createPaymentIntent: builder.mutation<PaymentIntentResponse, { amount: number }>({
            query: ({ amount }) => ({
                url: "/top-up",
                method: "POST",
                body: { amount },
            }),
        }),

        // Get payment history
        getPaymentHistory: builder.query<IPaymentHistory[], void>({
            query: () => "/history",
        }),

        // Make payment
        makePayment: builder.mutation<{ message: string }, MakePaymentRequest>({
            query: (paymentData) => ({
                url: "/make-payment",
                method: "POST",
                body: paymentData,
            }),
        }),
    }),
});

// Export hooks for usage in functional components
export const { useCreatePaymentIntentMutation, useGetPaymentHistoryQuery, useMakePaymentMutation } = paymentApi;
