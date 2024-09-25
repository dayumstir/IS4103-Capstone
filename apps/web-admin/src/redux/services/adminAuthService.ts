// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define a service using a base URL and expected endpoints
export const adminAuthApi = createApi({
  reducerPath: "adminAuthApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000/adminAuth" }),
  endpoints: (builder) => ({
    // Login
    login: builder.mutation<
      { token: string },
      { username: string; password: string }
    >({
      query: (body) => ({
        url: "/login",
        method: "POST",
        body,
      }),
      transformResponse: (response: { token: string }) => {
        localStorage.setItem("token", response.token);
        return response;
      },
    }),

    // Reset Password
    resetPassword: builder.mutation<
      void,
      { email: string; oldPassword: string; newPassword: string }
    >({
      query: ({ email, oldPassword, newPassword }) => ({
        url: "/reset-password",
        method: "POST",
        body: { email, oldPassword, newPassword },
      }),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useLoginMutation, useResetPasswordMutation } = adminAuthApi;
