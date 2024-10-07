import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IMerchant } from "@repo/interfaces";
import { RootState } from "../store"; // Make sure this import path is correct
import { API_URL } from "../../config/apiConfig";

// Define a service using a base URL and expected endpoints
export const merchantApi = createApi({
  reducerPath: "merchantApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/merchant`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).customerAuth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
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
