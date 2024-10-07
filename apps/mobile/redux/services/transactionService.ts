import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ITransaction } from "../../interfaces/transactionInterface";
import { RootState } from "../store"; // Make sure this import path is correct
import { API_URL } from "../../config/apiConfig";

// Define a service using a base URL and expected endpoints
export const transactionApi = createApi({
  reducerPath: "transactionApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/transaction`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).customerAuth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  endpoints: (builder) => ({
    // Create Transaction
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

    // Get User Transactions
    getUserTransactions: builder.query<ITransaction[], void>({
      query: () => "/user",
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useCreateTransactionMutation, useGetUserTransactionsQuery } =
  transactionApi;
