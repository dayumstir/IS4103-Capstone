// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LoginFormValues } from "../../screens/loginScreen";
import { IMerchant } from "../../interfaces/merchantInterface";

// Define a service using a base URL and expected endpoints
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000/merchant/auth" }),
  endpoints: (builder) => ({
    login: builder.mutation<{ id: string; token: string }, LoginFormValues>({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<IMerchant, FormData>({
      query: (body) => ({
        url: "/register",
        method: "POST",
        body: body,
      }),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useLoginMutation, useRegisterMutation } = authApi;
