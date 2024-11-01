import { createApi } from "@reduxjs/toolkit/query/react";
import { IMerchantPayment } from "@repo/interfaces/merchantPaymentInterface";
import BaseQueryWithAuthCheck from "../utils.tsx/baseQuery";

export const merchantPaymentApi = createApi({
  reducerPath: "merchantPaymentApi",
  baseQuery: BaseQueryWithAuthCheck("/merchantPayment"),
  tagTypes: ["MerchantPaymentList"],
  endpoints: (builder) => ({
    // Get all merchant payments
    getMerchantPayments: builder.query<IMerchantPayment[], void>({
      query: () => ({
        url: "/",
        method: "GET",
      }),
      providesTags: ["MerchantPaymentList"],
    }),

    // Get merchant payment by id
    getMerchantPaymentById: builder.query<IMerchantPayment, string>({
      query: (id) => `/${id}`,
    }),

    // Create merchant payment
    createMerchantPayment: builder.mutation<
      IMerchantPayment,
      Partial<IMerchantPayment>
    >({
      query: (payment) => ({
        url: "/",
        method: "POST",
        body: payment,
      }),
      invalidatesTags: ["MerchantPaymentList"],
    }),
  }),
});

export const {
  useGetMerchantPaymentsQuery,
  useGetMerchantPaymentByIdQuery,
  useCreateMerchantPaymentMutation,
} = merchantPaymentApi;
