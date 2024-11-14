// apps/web-merchant/src/redux/services/auth.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import BaseQueryWithAuthCheck from "../utils.tsx/baseQuery";
import { IMerchant } from "@repo/interfaces";
import { ResetPasswordValues } from "../../interfaces/screens/resetPasswordInterface";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: BaseQueryWithAuthCheck("/merchant/auth"),
  
  endpoints: (builder) => ({
    // Login
    login: builder.mutation<{ id: string; token: string; forgot_password: boolean }, { email: string, password: string }>({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),

    // Logout
    logout: builder.mutation<string, void>({
      query: (credentials) => ({
        url: "/logout",
        method: "POST",
        body: credentials,
      }),
    }),

    checkEmailInUse: builder.mutation<string, { email: string }>({
      query: ({ email }) => ({
        url: "/check-email-status",
        method: "POST",
        body: { email },
      }),
    }),
    sendPhoneNumberOTP: builder.mutation<string, { contact_number: string }>({
      query: ({ contact_number }) => ({
        url: "/send-phone-number-otp",
        method: "POST",
        body: { contact_number },
      }),
    }),
    verifyPhoneNumberOTP: builder.mutation<
      string,
      { contact_number: string; otp: string }
    >({
      query: ({ contact_number, otp }) => ({
        url: "/verify-phone-number-otp",
        method: "POST",
        body: { contact_number, otp },
      }),
    }),
    confirmEmail: builder.mutation<string, { email: string; token: string }>({
      query: ({ email, token }) => ({
        url: "/confirm-email",
        method: "POST",
        body: { email, token },
      }),
    }),
    resendEmailConfirmation: builder.mutation<string, { email: string }>({
      query: ({ email }) => ({
        url: "/resend-email-verification",
        method: "POST",
        body: { email },
      }),
    }),
    register: builder.mutation<IMerchant, FormData>({
      query: (body) => ({
        url: "/register",
        method: "POST",
        body: body,
      }),
    }),

    // Reset Password
    resetPassword: builder.mutation<{ error: string }, { id: string; body: ResetPasswordValues }>({
      query: ({ id, body }) => ({
        url: `/${id}/reset-password`,
        method: "POST",
        body: body,
      }),
    }),

    // Forget Password
    forgetPassword: builder.mutation<void, { email: string }>({
      query: (email) => ({
        url: "/forget-password",
        method: "POST",
        body: email,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useResetPasswordMutation,
  useLogoutMutation,
  useCheckEmailInUseMutation,
  useSendPhoneNumberOTPMutation,
  useVerifyPhoneNumberOTPMutation,
  useConfirmEmailMutation,
  useResendEmailConfirmationMutation,
  useForgetPasswordMutation,
} = authApi;
