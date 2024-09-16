import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ITransaction } from "../../interfaces/transactionInterface";
import { RootState } from "../store"; // Make sure this import path is correct

// Define a service using a base URL and expected endpoints
export const transactionApi = createApi({
  reducerPath: "transactionApi",
  baseQuery: fetchBaseQuery({
    // TODO: Change to env variable (base url)
    baseUrl: "http://localhost:3000/transaction",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).customerAuth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    createTransaction: builder.mutation<
      ITransaction,
      Omit<ITransaction, "transaction_id">
    >({
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
