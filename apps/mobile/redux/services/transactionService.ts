import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ITransaction, TransactionResult } from "@repo/interfaces";
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

  tagTypes: ["TransactionsList"],

  endpoints: (builder) => ({
    // Create Transaction
    createTransaction: builder.mutation<
      TransactionResult,
      Omit<ITransaction, "transaction_id">
    >({
      query: (newTransaction) => ({
        url: "/",
        method: "POST",
        body: newTransaction,
      }),
      invalidatesTags: ["TransactionsList"],
    }),

    // Get Customer Transactions
    getCustomerTransactions: builder.query<TransactionResult[], string>({
      query: (searchQuery = "") => `customer?search=${searchQuery}`,
      providesTags: ["TransactionsList"],
      keepUnusedDataFor: 0,
    }),

    // Get Transaction by Id
    getTransactionById: builder.query<TransactionResult, string>({
      query: (transactionId) => `/${transactionId}`,
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useCreateTransactionMutation,
  useGetCustomerTransactionsQuery,
  useGetTransactionByIdQuery,
} = transactionApi;
