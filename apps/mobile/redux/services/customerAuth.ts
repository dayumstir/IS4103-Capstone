// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LoginFormValues } from "../../app/login";
import { RegisterFormValues } from "../../app/register";

// Define a service using a base URL and expected endpoints
export const customerAuthApi = createApi({
  reducerPath: "customerAuthApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000/customerAuth" }),
  endpoints: (builder) => ({
    login: builder.mutation<string, LoginFormValues>({
      query: (body) => ({
        url: "/login",
        method: "POST",
        body,
      }),
    }),
    register: builder.mutation<string, RegisterFormValues>({
      query: (body) => ({
        url: "/register",
        method: "POST",
        body,
      }),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useLoginMutation, useRegisterMutation } = customerAuthApi;
