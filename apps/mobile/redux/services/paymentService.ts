// apps/mobile/redux/services/paymentService.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { API_URL } from "../../config/apiConfig";
import { IPaymentHistory } from "@repo/interfaces";

// Response interface for creating a payment intent
interface PaymentIntentResponse {
    paymentIntent: string;
    ephemeralKey: string;
    customer: string;
    publishableKey: string;
}

// Request body interface for makePayment
interface MakePaymentRequest {
    instalment_payment_id: string;
    voucher_assigned_id?: string;
    amount_discount_from_voucher?: number;
    amount_deducted_from_wallet: number;
    cashback_wallet_id?: string;
    amount_deducted_from_cashback_wallet?: number;
}

// Define the payment API service
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
    tagTypes: ["PaymentHistory"],
    endpoints: (builder) => ({

        // Create a payment intent for wallet top-up
        createPaymentIntent: builder.mutation<PaymentIntentResponse, { amount: number }>({
            query: ({ amount }) => ({
                url: "/top-up",
                method: "POST",
                body: { amount },
            }),
        }),

        // Fetch payment history for the authenticated customer
        getPaymentHistory: builder.query<IPaymentHistory[], void>({
            query: () => "/history",
            providesTags: ["PaymentHistory"],
        }),

        // Make a payment toward an instalment plan
        makePayment: builder.mutation<{ message: string }, MakePaymentRequest>({
            query: (paymentData) => ({
                url: "/make-payment",
                method: "POST",
                body: paymentData,
            }),
            invalidatesTags: ["PaymentHistory"],
        }),
    }),
});

export const {
    useCreatePaymentIntentMutation,
    useGetPaymentHistoryQuery,
    useMakePaymentMutation,
} = paymentApi;
