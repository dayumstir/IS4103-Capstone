import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LoginFormValues } from "../../app/login";
import { RegisterFormValues } from "../../app/register";
import { RootState } from "../store";
import { login } from "../features/customerAuthSlice";

// Define the API service for authentication
export const customerAuthApi = createApi({
  reducerPath: "customerAuthApi",

  baseQuery: fetchBaseQuery({ 
    baseUrl: "http://localhost:3000/customerAuth",
    prepareHeaders: (headers, { getState} ) => {
      const token = (getState() as RootState).customerAuth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),

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
