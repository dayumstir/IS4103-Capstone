import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ITransaction } from "@repo/interfaces";
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
      ITransaction,
      Omit<
        ITransaction,
        | "transaction_id"
        | "customer"
        | "merchant"
        | "instalment_plan"
        | "instalment_payments"
      >
    >({
      query: (newTransaction) => ({
        url: "/",
        method: "POST",
        body: newTransaction,
      }),
      invalidatesTags: ["TransactionsList"],
    }),

    // Get Customer Transactions
    getCustomerTransactions: builder.query<ITransaction[], void>({
      query: () => "/customer",
      providesTags: ["TransactionsList"],
    }),

    // Get Transaction by Id
    getTransactionById: builder.query<ITransaction, string>({
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
