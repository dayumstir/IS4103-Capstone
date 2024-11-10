import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TransactionResult, TransactionStats } from "@repo/interfaces";

export const transactionApi = createApi({
  reducerPath: "transactionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000/transaction",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["TransactionList"],
  endpoints: (builder) => ({
    // Get all transactions
    getTransactions: builder.query<TransactionResult[], string>({
      query: (search) => ({
        url: "/",
        params: { search },
      }),
      providesTags: ["TransactionList"],
    }),

    // Get transaction by id
    getTransactionById: builder.query<TransactionResult, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "TransactionList", id }],
    }),

    // Get transaction stats
    getTransactionStats: builder.query<TransactionStats, void>({
      query: () => "/stats",
      transformResponse: (response: TransactionStats) => {
        console.log("Transaction stats response:", response);
        return response;
      },
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useGetTransactionByIdQuery,
  useGetTransactionStatsQuery,
} = transactionApi;
