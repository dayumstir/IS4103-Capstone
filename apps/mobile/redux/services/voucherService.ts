import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store"; // Make sure this import path is correct
import { IVoucher, IVoucherAssigned } from "../../interfaces/voucherInterface";

// Define a service using a base URL and expected endpoints
export const voucherApi = createApi({
  reducerPath: "voucherApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000/voucher",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).customerAuth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["VoucherList"],
  endpoints: (builder) => ({
    // Get All Customer Vouchers
    getAllVouchers: builder.query<IVoucherAssigned[], { customer_id: string }>({
      query: ({ customer_id }) => ({
        url: `/customer/${customer_id}`,
        method: "GET",
      }),
      providesTags: ["VoucherList"],
    }),

    // Get Voucher by ID
    getVoucherById: builder.query<IVoucher, string>({
      query: (id) => ({
        url: `/details/${id}`,
        method: "GET",
      }),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetAllVouchersQuery, useGetVoucherByIdQuery } = voucherApi;