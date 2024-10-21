import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TransactionResult } from "@repo/interfaces";

export const transactionApi = createApi({
  reducerPath: "transactionApi",
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
  tagTypes: ["TransactionList"],
  endpoints: (builder) => ({
    // Get all transactions
    getTransactions: builder.query<TransactionResult[], string>({
      query: (search) => ({
        url: "/transaction",
        params: { search },
      }),
      providesTags: ["TransactionList"],
    }),

    // Get transaction by id
    getTransactionById: builder.query<TransactionResult, string>({
      query: (id) => `/transaction/${id}`,
      providesTags: (result, error, id) => [{ type: "TransactionList", id }],
    }),
  }),
});

export const { useGetTransactionsQuery, useGetTransactionByIdQuery } =
  transactionApi;
