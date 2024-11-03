import { createApi } from "@reduxjs/toolkit/query/react";
import { IMerchantPayment } from "@repo/interfaces/merchantPaymentInterface";
import BaseQueryWithAuthCheck from "../utils.tsx/baseQuery";

export const merchantPaymentApi = createApi({
  reducerPath: "merchantPaymentApi",
  baseQuery: BaseQueryWithAuthCheck("/merchantPayment"),
  tagTypes: ["MerchantPaymentList"],
  endpoints: (builder) => ({
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

export const { useCreateMerchantPaymentMutation } = merchantPaymentApi;
