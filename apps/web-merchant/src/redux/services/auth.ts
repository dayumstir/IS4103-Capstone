// Need to use the React-specific entry point to import createApi
import { createApi } from "@reduxjs/toolkit/query/react";
import { IMerchant } from "../../interfaces/models/merchantInterface";
import { ResetPasswordValues } from "../../interfaces/screens/resetPasswordInterface";
import { LoginFormValues } from "../../screens/loginScreen";
import BaseQueryWithAuthCheck from "../utils.tsx/baseQuery";

// Define a service using a base URL and expected endpoints
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: BaseQueryWithAuthCheck("/merchant/auth"),
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

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
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
