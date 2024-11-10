import { createApi } from "@reduxjs/toolkit/query/react";
import {
  IMerchantPayment,
  IMerchantPaymentFilter,
} from "@repo/interfaces/merchantPaymentInterface";
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
    getMerchantPayments: builder.mutation<
      IMerchantPayment[],
      IMerchantPaymentFilter
    >({
      query: (body) => ({
        url: "/list",
        method: "POST",
        body: body,
      }),
    }),
    getMerchantPayment: builder.query<IMerchantPayment, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateMerchantPaymentMutation,
  useGetMerchantPaymentsMutation,
  useGetMerchantPaymentQuery,
} = merchantPaymentApi;
