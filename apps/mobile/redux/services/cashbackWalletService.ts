// app/mobile/redux/services/cashbackWalletService.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../config/apiConfig";
import { RootState } from "../store";
import { ICashbackWallet } from "@repo/interfaces";

// Define a service using a base URL and expected endpoints
export const cashbackWalletApi = createApi({
  reducerPath: "cashbackWalletApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/cashbackWallet`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).customerAuth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["CashbackWallet"],
  endpoints: (builder) => ({

    // Get All Customer Cashback Wallets
    getAllCashbackWallets: builder.query<ICashbackWallet[], { customer_id: string }>({
      query: ({ customer_id }) => ({
        url: `/${customer_id}`,
        method: "GET",
      }),
      providesTags: [{ type: "CashbackWallet", id: "LIST" }],
    }),
  }),
});

export const { 
  useGetAllCashbackWalletsQuery
} = cashbackWalletApi;
