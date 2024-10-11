// src/redux/services/paymentService.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { API_URL } from "../../config/apiConfig";

interface PaymentIntentResponse {
    paymentIntent: string;
    ephemeralKey: string;
    customer: string;
    publishableKey: string;
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
    }),
});

// Export hooks for usage in functional components
export const { useCreatePaymentIntentMutation } = paymentApi;
