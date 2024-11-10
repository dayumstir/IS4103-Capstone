import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LoginFormValues } from "../../app/login";
import { RegisterFormValues } from "../../app/register";
import { ResetPasswordFormValues } from "../../app/(authenticated)/(tabs)/account/resetPassword";
import { RootState } from "../store";
import { ConfirmEmailFormValues } from "../../app/confirmation";
import { PhoneVerificationFormValues } from "../../app/phoneVerification";
import { API_URL } from "../../config/apiConfig";

// Define the API service for authentication
export const customerAuthApi = createApi({
  reducerPath: "customerAuthApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/customerAuth`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).customerAuth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
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

    resetPassword: builder.mutation<string, ResetPasswordFormValues>({
      query: (body) => ({
        url: "/reset-password",
        method: "POST",
        body,
      }),
    }),

    confirmEmail: builder.mutation<string, ConfirmEmailFormValues>({
      query: (body) => ({
        url: "/confirm-email",
        method: "POST",
        body,
      }),
    }),

    sendPhoneNumberOTP: builder.mutation<string, { contact_number: string }>({
      query: (body) => ({
        url: "/send-phone-number-otp",
        method: "POST",
        body,
      }),
    }),

    verifyPhoneNumberOTP: builder.mutation<string, PhoneVerificationFormValues>(
      {
        query: (body) => ({
          url: "/verify-phone-number-otp",
          method: "POST",
          body,
        }),
      },
    ),
    
    resendEmailVerification: builder.mutation<void, { email: string }>({
      query: (body) => ({
        url: "/resend-email",
        method: "POST",
        body,
      }),
    }),


    // Forget password
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
  useConfirmEmailMutation,
  useSendPhoneNumberOTPMutation,
  useVerifyPhoneNumberOTPMutation,
  useResendEmailVerificationMutation,
  useForgetPasswordMutation,
} = customerAuthApi;
