// app/web-admin/src/redux/services/adminAuthService.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adminAuthApi = createApi({
  reducerPath: "adminAuthApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000/adminAuth",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  endpoints: (builder) => ({
    
    // Login
    login: builder.mutation<{ jwtToken: string, admin_type: string, email: string, admin_id: string}, { username: string; password: string }>({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: { jwtToken: string, admin_type: string, email: string, admin_id: string}) => {
        localStorage.setItem("token", response.jwtToken);
        localStorage.setItem("adminId", response.admin_id);
        return response;
      },
    }),

    // Logout
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      onQueryStarted: async (_, { queryFulfilled }) => {
        await queryFulfilled;
        localStorage.removeItem("token");
        localStorage.removeItem("adminId");
      },
    }),

    // Reset Password
    resetPassword: builder.mutation<void, { email: string; oldPassword: string; newPassword: string }>({
      query: (passwordData) => ({
        url: "/reset-password",
        method: "POST",
        body: passwordData,
      }),
    }),
  }),
});

export const { 
  useLoginMutation,
  useLogoutMutation,
  useResetPasswordMutation
} = adminAuthApi;
