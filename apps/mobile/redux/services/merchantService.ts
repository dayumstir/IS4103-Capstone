import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IMerchant } from "../../interfaces/merchantInterface";
import { RootState } from "../store"; // Make sure this import path is correct

// Define a service using a base URL and expected endpoints
export const merchantApi = createApi({
  reducerPath: "merchantApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000/merchant",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).customerAuth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Get Merchant by ID
    getMerchantById: builder.query<IMerchant, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetMerchantByIdQuery } = merchantApi;
