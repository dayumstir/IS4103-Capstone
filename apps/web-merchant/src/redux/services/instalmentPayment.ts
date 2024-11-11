// Need to use the React-specific entry point to import createApi
import { createApi } from "@reduxjs/toolkit/query/react";
import BaseQueryWithAuthCheck from "../utils.tsx/baseQuery";
import { IInstalmentPayment } from "@repo/interfaces";

// Define a service using a base URL and expected endpoints
export const instalmentPaymentApi = createApi({
  reducerPath: "instalmentPaymentApi",
  baseQuery: BaseQueryWithAuthCheck("/instalmentPayment"),
  endpoints: (builder) => ({
    getMerchantInstalmentPayments: builder.query<IInstalmentPayment[], void>({
      query: () => ({
        url: "/merchant",
        method: "GET",
      }),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetMerchantInstalmentPaymentsQuery } = instalmentPaymentApi;
