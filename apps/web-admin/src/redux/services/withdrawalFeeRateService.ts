import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IWithdrawalFeeRate } from "../../interfaces/withdrawalFeeRateInterface";

export const withdrawalFeeRateApi = createApi({
  reducerPath: "withdrawalFeeRateApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["WithdrawalFeeRateList"],
  endpoints: (builder) => ({
    // Get all Withdrawal Fee Rate 
    getWithdrawalFeeRates: builder.query<IWithdrawalFeeRate[], void>({
      query: () => "/withdrawalFeeRate",
      providesTags: ["WithdrawalFeeRateList"],
    }),

    // Create Withdrawal Fee Rate 
    createWithdrawalFeeRate: builder.mutation<
    IWithdrawalFeeRate,
      Omit<IWithdrawalFeeRate, "withdrawal_fee_rate_id">
    >({
      query: (withdrawalFeeRate) => ({
        url: "/withdrawalFeeRate",
        method: "POST",
        body: withdrawalFeeRate,
      }),
      invalidatesTags: ["WithdrawalFeeRateList"],
    }),

    // Update Withdrawal Fee Rate
    updateWithdrawalFeeRate: builder.mutation<IWithdrawalFeeRate, IWithdrawalFeeRate>({
      query: (withdrawalFeeRate) => ({
        url: `/withdrawalFeeRate/${withdrawalFeeRate.withdrawal_fee_rate_id}`,
        method: "PUT",
        body: withdrawalFeeRate,
      }),
      invalidatesTags: ["WithdrawalFeeRateList"],
    }),

      // Delete Withdrawal Fee Rate
      deleteWithdrawalFeeRate: builder.mutation<void, string>({
        query: (id) => ({
          url: `/withdrawalFeeRate/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["WithdrawalFeeRateList"],
      }),
  }),
});

export const {
  useGetWithdrawalFeeRatesQuery,
  useCreateWithdrawalFeeRateMutation,
  useUpdateWithdrawalFeeRateMutation,
  useDeleteWithdrawalFeeRateMutation,
} = withdrawalFeeRateApi;
