// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ITransaction } from "../../interfaces/transactionInterface";

// Define a service using a base URL and expected endpoints
export const transactionApi = createApi({
  reducerPath: "transactionApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000/transaction" }),
  endpoints: (builder) => ({
    createTransaction: builder.mutation<ITransaction, Omit<ITransaction, "transaction_id">>({
      query: (newTransaction) => ({
        url: "/",
        method: "POST",
        body: newTransaction,
      }),
    }),
    getUserTransactions: builder.query<ITransaction[], void>({
      query: () => "/user",
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useCreateTransactionMutation, useGetUserTransactionsQuery } =
  transactionApi;
