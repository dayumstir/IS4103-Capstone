import { createApi } from "@reduxjs/toolkit/query/react";
import { IMerchantPayment } from "@repo/interfaces/merchantPaymentInterface";
import BaseQueryWithAuthCheck from "../utils.tsx/baseQuery";
import { IMerchantSize, IWithdrawalFeeRate } from "@repo/interfaces";

export const merchantPaymentApi = createApi({
  reducerPath: "merchantPaymentApi",
  baseQuery: BaseQueryWithAuthCheck(""),
  tagTypes: ["MerchantPaymentList"],
  endpoints: (builder) => ({
    // Create merchant payment
    createMerchantPayment: builder.mutation<
      IMerchantPayment,
      Partial<IMerchantPayment>
    >({
      query: (payment) => ({
        url: "/merchantPayment",
        method: "POST",
        body: payment,
      }),
      invalidatesTags: ["MerchantPaymentList"],
    }),

    // Calculate withdrawal info
    calculateWithdrawalInfo: builder.query<
      {
        withdrawalFeeRate: IWithdrawalFeeRate;
        monthlyRevenue: number;
        merchantSize: IMerchantSize;
      },
      void
    >({
      query: () => ({
        url: "/merchantPayment/withdrawal-info",
        method: "GET",
      }),
    }),

    // Get all merchant sizes
    getMerchantSizes: builder.query<IMerchantSize[], void>({
      query: () => ({
        url: "/merchantSize",
        method: "GET",
      }),
    }),

    // Get all withdrawal fee rates
    getWithdrawalFeeRates: builder.query<IWithdrawalFeeRate[], void>({
      query: () => ({
        url: "/withdrawalFeeRate",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateMerchantPaymentMutation,
  useCalculateWithdrawalInfoQuery,
  useGetMerchantSizesQuery,
  useGetWithdrawalFeeRatesQuery,
} = merchantPaymentApi;
