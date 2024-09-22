// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LoginFormValues } from "../../screens/loginScreen";
import { IMerchant } from "../../interfaces/merchantInterface";
import { ResetPasswordValues } from "../../interfaces/resetPasswordInterface";

// Define a service using a base URL and expected endpoints
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000/merchant/auth",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<{ id: string; token: string }, LoginFormValues>({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),
    logout: builder.mutation<string, void>({
      query: (credentials) => ({
        url: "/logout",
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
    resetPassword: builder.mutation<
      { error: string },
      { id: string; body: ResetPasswordValues }
    >({
      query: ({ id, body }) => ({
        url: `/${id}/reset-password`,
        method: "POST",
        body: body,
      }),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useLoginMutation,
  useRegisterMutation,
  useResetPasswordMutation,
  useLogoutMutation,
} = authApi;
