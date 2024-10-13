// Need to use the React-specific entry point to import createApi
import { createApi } from "@reduxjs/toolkit/query/react";
import BaseQueryWithAuthCheck from "../utils.tsx/baseQuery";
import {
  TransactionFilter,
  TransactionResult,
} from "../../../../../packages/interfaces/transactionInterface";

// Define a service using a base URL and expected endpoints
export const transactionApi = createApi({
  reducerPath: "transactionApi",
  baseQuery: BaseQueryWithAuthCheck("/transaction"),
  endpoints: (builder) => ({
    getTransactionsByFilter: builder.mutation<
      TransactionResult[],
      TransactionFilter
    >({
      query: (body) => ({
        url: "/list",
        method: "POST",
        body: body,
      }),
    }),
    getTransaction: builder.query<TransactionResult, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetTransactionsByFilterMutation, useGetTransactionQuery } =
  transactionApi;
