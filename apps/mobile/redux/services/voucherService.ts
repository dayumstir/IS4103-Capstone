// app/mobile/redux/services/voucherService.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../config/apiConfig";
import { RootState } from "../store";
import { IVoucher, IVoucherAssigned } from "@repo/interfaces";

// Define a service using a base URL and expected endpoints
export const voucherApi = createApi({
  reducerPath: "voucherApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/voucher`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).customerAuth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Voucher"],
  endpoints: (builder) => ({

    // Get All Customer Vouchers
    getAllVouchers: builder.query<IVoucherAssigned[], { customer_id: string }>({
      query: ({ customer_id }) => ({
        url: `/customer/${customer_id}`,
        method: "GET",
      }),
      providesTags: [{ type: "Voucher", id: "LIST" }],
    }),
  }),
});

export const { 
  useGetAllVouchersQuery
} = voucherApi;
