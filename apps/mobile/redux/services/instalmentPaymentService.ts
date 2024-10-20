import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IInstalmentPayment } from "@repo/interfaces";
import { RootState } from "../store"; // Make sure this import path is correct
import { API_URL } from "../../config/apiConfig";

// Define a service using a base URL and expected endpoints
export const instalmentPaymentApi = createApi({
  reducerPath: "instalmentPaymentApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/instalment-payment`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).customerAuth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ["InstalmentPaymentsList"],

  endpoints: (builder) => ({
    // Get Outstanding Customer Instalment Payments
    getCustomerOutstandingInstalmentPayments: builder.query<
      IInstalmentPayment[],
      void
    >({
      query: () => "/customer",
      providesTags: ["InstalmentPaymentsList"],
    }),

    // Get Instalment Payment by Id
    getInstalmentPaymentById: builder.query<IInstalmentPayment, string>({
      query: (instalmentPaymentId) => `/${instalmentPaymentId}`,
    }),

    // Pay Instalment Payment
    payInstalmentPayment: builder.mutation<void, string>({
      query: (instalmentPaymentId) => ({
        url: `/${instalmentPaymentId}/pay`,
        method: "POST",
      }),
      invalidatesTags: ["InstalmentPaymentsList"],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetCustomerOutstandingInstalmentPaymentsQuery,
  useGetInstalmentPaymentByIdQuery,
  usePayInstalmentPaymentMutation,
} = instalmentPaymentApi;
