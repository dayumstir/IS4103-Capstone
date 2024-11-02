import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IMerchantPayment } from "@repo/interfaces";

export const merchantPaymentApi = createApi({
  reducerPath: "merchantPaymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000/merchantPayment",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["MerchantPaymentList"],
  endpoints: (builder) => ({
    // Get all merchant payments
    getMerchantPayments: builder.query<IMerchantPayment[], string>({
      query: (search) => ({
        url: "/",
        params: { search },
      }),
      providesTags: ["MerchantPaymentList"],
    }),

    // Get merchant payment by id
    getMerchantPaymentById: builder.query<IMerchantPayment, string>({
      query: (id) => `/${id}`,
    }),

    // Create merchant payment
    createMerchantPayment: builder.mutation<
      IMerchantPayment,
      Partial<IMerchantPayment>
    >({
      query: (payment) => ({
        url: "/",
        method: "POST",
        body: payment,
      }),
      invalidatesTags: ["MerchantPaymentList"],
    }),

    // Update merchant payment
    updateMerchantPayment: builder.mutation<
      IMerchantPayment,
      Partial<IMerchantPayment>
    >({
      query: (payment) => ({
        url: `/${payment.merchant_payment_id}`,
        method: "PUT",
        body: payment,
      }),
      invalidatesTags: ["MerchantPaymentList"],
    }),
  }),
});

export const {
  useGetMerchantPaymentsQuery,
  useGetMerchantPaymentByIdQuery,
  useCreateMerchantPaymentMutation,
  useUpdateMerchantPaymentMutation,
} = merchantPaymentApi;
